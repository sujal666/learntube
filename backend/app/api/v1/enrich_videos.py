from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.schemas.enrichment import VideoEnrichmentResult
from app.services.comments import fetch_top_comments
from app.services.nlp import (
    analyze_comments_sentiment,
    classify_difficulty,
    extract_topics,
)
from app.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/enrich", tags=["enrichment"])


@router.post("/videos/{video_id}", response_model=VideoEnrichmentResult)
def enrich_video(video_id: str, client: Client = Depends(get_supabase_client)):
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
            detail=f"No video found for id {video_id}",
        )

    text = " ".join(
        filter(None, [video.get("title"), video.get("description")])
    ).strip()
    diff = classify_difficulty(text)
    topics = extract_topics(text)

    sentiment_score = None
    comment_count = 0
    try:
        comments = fetch_top_comments(video_id)
        sentiment = analyze_comments_sentiment(comments)
        sentiment_score = sentiment["score"]
        comment_count = sentiment["count"]
    except Exception:
        # If comments fail to load, keep default values
        sentiment_score = None
        comment_count = 0

    update_payload = {
        "difficulty": diff["label"],
        "difficulty_confidence": diff["score"],
        "topic_tags": topics,
        "sentiment_score": sentiment_score,
        "comment_count_analyzed": comment_count,
    }
    client.table("videos_raw").update(update_payload).eq("video_id", video_id).execute()

    return VideoEnrichmentResult(
        video_id=video_id,
        difficulty=diff["label"],
        difficulty_confidence=diff["score"],
        sentiment_score=sentiment_score,
        comment_count_analyzed=comment_count,
        topic_tags=topics,
    )
