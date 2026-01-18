from app.worker.celery_app import celery_app


@celery_app.task(name="tasks.embed_video")
def embed_video(video_id: str) -> dict:
    """
    Placeholder task for generating embeddings for a given video.
    Connects to Hugging Face / OpenAI models and writes to Supabase vectors.
    """
    return {"video_id": video_id, "status": "pending"}
