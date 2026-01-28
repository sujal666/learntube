from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.services.embeddings import embed_text
from app.services.supabase_client import get_supabase_client
from app.api.v1.feedback_utils import adjust_preferences_with_feedback

router = APIRouter(prefix="/embeddings", tags=["embeddings"])


def _make_text_from_video(video: Dict[str, Any]) -> str:
    parts = [
        video.get("title"),
        video.get("description"),
    ]
    tags = video.get("topic_tags") or []
    if tags:
        parts.append(" ".join(tags))
    return " ".join(filter(None, parts)).strip()


def _make_text_from_user(profile: Dict[str, Any], preferences: Dict[str, Any]) -> str:
    segments: List[str] = []
    goals = profile.get("goals") or []
    if goals:
        segments.append(" ".join(goals))
    objective = profile.get("main_objective")
    if objective:
        segments.append(objective)
    skill_levels = preferences.get("skill_levels") or []
    if skill_levels:
        segments.append(" ".join(skill_levels))
    style = preferences.get("learning_style")
    if style:
        segments.append(style)
    topics = preferences.get("preferred_video_length")
    if topics:
        segments.append(topics)
    return " ".join(filter(None, segments)).strip()


@router.post("/videos/{video_id}")
def embed_video(video_id: str, client: Client = Depends(get_supabase_client)):
    video_id = video_id.strip()
    video_resp = (
        client.table("videos_raw")
        .select("title, description, topic_tags, difficulty, sentiment_score")
        .eq("video_id", video_id)
        .maybe_single()
        .execute()
    )
    video = video_resp.data
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No video with id {video_id}",
        )

    text = _make_text_from_video(video)
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Video metadata missing text to embed.",
        )

    embedding = embed_text(text)
    client.table("video_embeddings").upsert(
        {
            "video_id": video_id,
            "embedding": embedding,
            "topics": video.get("topic_tags") or [],
            "difficulty": video.get("difficulty"),
            "sentiment_score": video.get("sentiment_score"),
        },
        on_conflict="video_id",
    ).execute()

    return {
        "video_id": video_id,
        "embedding": embedding,
        "difficulty": video.get("difficulty"),
        "sentiment_score": video.get("sentiment_score"),
    }


@router.post("/users/{user_id}")
def embed_user(
    user_id: str,
    client: Client = Depends(get_supabase_client),
):
    profile_resp = client.table("user_profiles").select("*").eq("user_id", user_id).maybe_single().execute()
    preferences_resp = client.table("user_preferences").select("*").eq("user_id", user_id).maybe_single().execute()

    profile = profile_resp.data or {}
    preferences = preferences_resp.data or {}
    text = _make_text_from_user(profile, preferences)
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient onboarding data to build user embedding.",
        )

    embedding = embed_text(text)
    client.table("user_embeddings").upsert(
        {
            "user_id": user_id,
            "embedding": embedding,
            "goals": profile.get("goals") or [],
        },
        on_conflict="user_id",
    ).execute()

    return {
        "user_id": user_id,
        "embedding": embedding,
        "goals": profile.get("goals") or [],
    }


@router.post("/recommendations/{user_id}")
def recommend_videos(
    user_id: str,
    client: Client = Depends(get_supabase_client),
    limit: int = Query(10, ge=1, le=50),
    min_sentiment: float = Query(0.0, ge=0.0, le=1.0),
    difficulty_filter: Optional[str] = Query(None),
    similarity_threshold: float = Query(0.0, ge=0.0, le=1.0),
    explain_top: int = Query(3, ge=0, le=20),
    include_reasons: bool = Query(True),
):
    user_id = user_id.strip()
    user_resp = (
        client.table("user_embeddings")
        .select("embedding")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not user_resp or not getattr(user_resp, "data", None):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User embedding not found. Run the embedding endpoint first.",
        )

    query_embedding = user_resp.data.get("embedding")
    if not query_embedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stored user embedding is empty.",
        )

    # adjust based on prior feedback
    difficulty_filter, min_sentiment = adjust_preferences_with_feedback(
        client, user_id, difficulty_filter, min_sentiment
    )

    search_resp = client.rpc("search_video_embeddings", {"query": query_embedding, "_limit": limit}).execute()
    videos = (search_resp.data if search_resp and getattr(search_resp, "data", None) else []) or []

    accepted = []
    rejected = []
    for record in videos:
        reasons = []
        sim = record.get("similarity") or 0.0
        if sim < similarity_threshold:
            reasons.append("similarity too low")
        if difficulty_filter and record.get("difficulty") != difficulty_filter:
            reasons.append("difficulty mismatch")
        if record.get("sentiment_score") is not None and record.get("sentiment_score") < min_sentiment:
            reasons.append("sentiment below threshold")

        if reasons:
            rejected.append(
                {
                    **record,
                    "accepted": False,
                    "rejection_reason": "; ".join(reasons) if include_reasons else None,
                }
            )
        else:
            accepted.append({**record, "accepted": True})

    # Optionally trim accepted set to top explain_top for downstream LLM explanation to save cost
    explain_candidates = accepted[:explain_top] if explain_top >= 0 else accepted

    return {
        "user_id": user_id,
        "accepted": accepted,
        "rejected": rejected,
        "explain_candidates": explain_candidates,
    }
