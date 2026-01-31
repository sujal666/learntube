from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.schemas.ingestion import YoutubeIngestRequest, YoutubeIngestResponse
from app.services.supabase_client import get_supabase_client
from app.services.youtube import fetch_youtube_metadata

router = APIRouter(prefix="/ingest", tags=["ingestion"])


@router.post("/youtube", response_model=YoutubeIngestResponse)
def ingest_youtube(
    payload: YoutubeIngestRequest,
    client: Client = Depends(get_supabase_client),
):
    if not payload.topics:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="topics is required")

    try:
        videos = fetch_youtube_metadata(
            topics=payload.topics,
            max_results_per_topic=payload.max_results_per_topic,
            min_view_count=payload.min_view_count,
            max_age_days=payload.max_age_days,
            exclude_keywords=payload.exclude_keywords,
            order=payload.order,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch from YouTube: {exc}",
        ) from exc

    attempted = len(videos)
    if not videos:
        return YoutubeIngestResponse(inserted=0, attempted=0, skipped=0, topics=payload.topics)

    try:
        if payload.refresh:
            # remove existing rows for these topics to force fresh set
            client.table("videos_raw").delete().contains("topics_source", payload.topics).execute()
        resp = client.table("videos_raw").upsert(videos, on_conflict="video_id").execute()
        inserted = len(resp.data) if resp and resp.data else 0
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist videos: {exc}",
        ) from exc

    skipped = max(attempted - inserted, 0)
    video_ids = [v.get("video_id") for v in videos if v.get("video_id")]
    return YoutubeIngestResponse(
        inserted=inserted,
        attempted=attempted,
        skipped=skipped,
        topics=payload.topics,
        video_ids=video_ids,
    )
