from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.services.explanations import build_context_payload, generate_explanation
from app.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/explanations", tags=["explanations"])


def _fetch_user_data(client: Client, user_id: str) -> tuple[dict, dict, dict]:
    def safe_fetch(table: str) -> dict:
        try:
            resp = client.table(table).select("*").eq("user_id", user_id).maybe_single().execute()
            return resp.data or {}
        except Exception:
            return {}

    profile = safe_fetch("user_profiles")
    preferences = safe_fetch("user_preferences")
    embedding = safe_fetch("user_embeddings")

    return profile, preferences, embedding


def _fetch_video_data(client: Client, video_id: str) -> dict:
    video_id = video_id.strip()
    try:
        video_resp = (
            client.table("videos_raw")
            .select("*")
            .eq("video_id", video_id)
            .maybe_single()
            .execute()
        )
        video = video_resp.data if video_resp else None
    except Exception:
        video = None

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video {video_id} not found",
        )
    return video


@router.post("/video/{video_id}/user/{user_id}")
def explain_recommendation(
    video_id: str,
    user_id: str,
    client: Client = Depends(get_supabase_client),
    similarity: float | None = Query(None, description="Optional similarity score from pgvector"),
    min_sentiment: float = Query(0.0, ge=0.0, le=1.0),
    difficulty_filter: str | None = Query(None),
):
    profile, preferences, user_embedding = _fetch_user_data(client, user_id)
    video = _fetch_video_data(client, video_id)

    context = build_context_payload(
        user_id,
        profile,
        preferences,
        user_embedding,
        video,
        {
            "similarity": similarity,
            "min_sentiment": min_sentiment,
            "difficulty_filter": difficulty_filter,
        },
    )

    explanation = generate_explanation(context)
    return {
        "user_id": user_id,
        "video_id": video_id,
        "explanation": explanation["explanation"],
        "usage": explanation["usage"],
        "context": explanation["context"],
    }


@router.post("/batch/{user_id}")
def explain_batch(
    user_id: str,
    video_ids: list[str],
    client: Client = Depends(get_supabase_client),
    min_sentiment: float = Query(0.0, ge=0.0, le=1.0),
    difficulty_filter: str | None = Query(None),
):
    profile, preferences, user_embedding = _fetch_user_data(client, user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User profile not found for {user_id}",
        )

    results = []
    for vid in video_ids:
        video = _fetch_video_data(client, vid)
        context = build_context_payload(
            user_id,
            profile,
            preferences,
            user_embedding,
            video,
            {
                "similarity": None,
                "min_sentiment": min_sentiment,
                "difficulty_filter": difficulty_filter,
            },
        )
        explanation = generate_explanation(context)
        results.append(
            {
                "user_id": user_id,
                "video_id": vid,
                "explanation": explanation["explanation"],
                "usage": explanation["usage"],
                "context": explanation["context"],
            }
        )
    return {"user_id": user_id, "results": results}


@router.post("/recommendations/{user_id}")
def explain_recommendations(
    user_id: str,
    client: Client = Depends(get_supabase_client),
    limit: int = Query(10, ge=1, le=50),
    min_sentiment: float = Query(0.0, ge=0.0, le=1.0),
    difficulty_filter: str | None = Query(None),
    similarity_threshold: float = Query(0.0, ge=0.0, le=1.0),
    explain_top: int = Query(3, ge=0, le=20),
):
    profile, preferences, user_embedding = _fetch_user_data(client, user_id)
    # fetch user embedding
    user_embed_resp = (
        client.table("user_embeddings")
        .select("embedding")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not user_embed_resp or not getattr(user_embed_resp, "data", None):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User embedding not found. Run the embedding endpoint first.",
        )
    query_embedding = user_embed_resp.data.get("embedding")
    if not query_embedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stored user embedding is empty.",
        )

    # vector search
    search_resp = client.rpc("search_video_embeddings", {"query": query_embedding, "_limit": limit}).execute()
    candidates = (search_resp.data if search_resp and getattr(search_resp, "data", None) else []) or []

    accepted = []
    rejected = []
    for record in candidates:
        reasons = []
        sim = record.get("similarity") or 0.0
        if sim < similarity_threshold:
            reasons.append("similarity too low")
        if difficulty_filter and record.get("difficulty") != difficulty_filter:
            reasons.append("difficulty mismatch")
        if record.get("sentiment_score") is not None and record.get("sentiment_score") < min_sentiment:
            reasons.append("sentiment below threshold")

        if reasons:
            rejected.append({**record, "accepted": False, "rejection_reason": "; ".join(reasons)})
        else:
            accepted.append({**record, "accepted": True})

    explain_list = accepted[:explain_top] if explain_top >= 0 else accepted

    explanations = []
    for rec in explain_list:
        vid = rec["video_id"]
        try:
            video = _fetch_video_data(client, vid)
        except HTTPException:
            rejected.append({**rec, "accepted": False, "rejection_reason": "video metadata missing"})
            continue
        ctx = build_context_payload(
            user_id,
            profile,
            preferences,
            user_embedding,
            video,
            {
                "similarity": rec.get("similarity"),
                "min_sentiment": min_sentiment,
                "difficulty_filter": difficulty_filter,
            },
        )
        result = generate_explanation(ctx)
        explanations.append(
            {
                "video_id": vid,
                "similarity": rec.get("similarity"),
                "difficulty": video.get("difficulty"),
                "sentiment_score": video.get("sentiment_score"),
                "topic_tags": video.get("topic_tags"),
                "explanation": result["explanation"],
                "usage": result["usage"],
            }
        )

    return {
        "user_id": user_id,
        "accepted": accepted,
        "rejected": rejected,
        "explanations": explanations,
    }
