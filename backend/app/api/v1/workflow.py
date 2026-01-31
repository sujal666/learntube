from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.schemas.ingestion import YoutubeIngestRequest
from app.services.comments import fetch_top_comments
from app.api.v1.embeddings import embed_user, embed_video
from app.services.nlp import analyze_comments_sentiment, classify_difficulty, extract_topics
from app.services.supabase_client import get_supabase_client
from app.services.youtube import fetch_youtube_metadata

router = APIRouter(prefix="/workflow", tags=["workflow"])


@router.post("/onboarding-refresh")
def onboarding_refresh(payload: YoutubeIngestRequest, client: Client = Depends(get_supabase_client)):
    """
    One-shot pipeline: ingest (with optional refresh), enrich, embed, then return video_ids.
    Note: user_id is not part of YoutubeIngestRequest; frontend should call embeddings/recs separately per user.
    """
    if not payload.topics:
        raise HTTPException(status_code=400, detail="topics is required")

    videos = fetch_youtube_metadata(
        topics=payload.topics,
        max_results_per_topic=payload.max_results_per_topic,
        min_view_count=payload.min_view_count,
        max_age_days=payload.max_age_days,
        exclude_keywords=payload.exclude_keywords,
        order=payload.order,
    )

    if payload.refresh:
        client.table("videos_raw").delete().contains("topics_source", payload.topics).execute()

    if videos:
        client.table("videos_raw").upsert(videos, on_conflict="video_id").execute()

    enriched_ids = []
    for v in videos:
        vid = v.get("video_id")
        if not vid:
            continue
        text = " ".join(filter(None, [v.get("title"), v.get("description")])).strip()
        diff = classify_difficulty(text)
        topics = extract_topics(text)
        sentiment_score = None
        comment_count = 0
        try:
            comments = fetch_top_comments(vid)
            sentiment = analyze_comments_sentiment(comments)
            sentiment_score = sentiment["score"]
            comment_count = sentiment["count"]
        except Exception:
            pass
        client.table("videos_raw").update(
            {
                "difficulty": diff["label"],
                "difficulty_confidence": diff["score"],
                "topic_tags": topics,
                "sentiment_score": sentiment_score,
                "comment_count_analyzed": comment_count,
            }
        ).eq("video_id", vid).execute()

        embed_video(vid, client)
        enriched_ids.append(vid)

    return {"ingested": len(videos), "enriched": len(enriched_ids), "video_ids": enriched_ids}
