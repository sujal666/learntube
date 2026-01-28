from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from supabase import Client

from app.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/feedback", tags=["feedback"])


class FeedbackPayload(BaseModel):
    user_id: str
    video_id: str
    feedback_type: str

    @field_validator("feedback_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"helpful", "not_helpful", "too_easy", "too_hard"}
        if v not in allowed:
            raise ValueError(f"feedback_type must be one of {allowed}")
        return v


@router.post("")
def submit_feedback(payload: FeedbackPayload, client: Client = Depends(get_supabase_client)):
    try:
        client.table("recommendation_feedback").insert(
            {
                "user_id": payload.user_id,
                "video_id": payload.video_id,
                "feedback_type": payload.feedback_type,
            }
        ).execute()
    except Exception as exc:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record feedback: {exc}",
        ) from exc

    return {"status": "ok"}
