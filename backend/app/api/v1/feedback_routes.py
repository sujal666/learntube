from fastapi import APIRouter, Depends
from supabase import Client

from app.api.v1.feedback_utils import adjust_preferences_with_feedback
from app.core.config import get_settings
from app.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/feedback-debug", tags=["feedback-debug"])


@router.get("/{user_id}")
def get_feedback_tuning(user_id: str, client: Client = Depends(get_supabase_client)):
    # Expose the computed adjustments for debugging/demo
    difficulty_filter, min_sentiment = adjust_preferences_with_feedback(client, user_id, None, 0.0)
    return {
        "user_id": user_id,
        "effective_difficulty_filter": difficulty_filter,
        "effective_min_sentiment": min_sentiment,
    }
