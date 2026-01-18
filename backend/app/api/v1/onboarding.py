from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.schemas.onboarding import OnboardingPayload
from app.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("")
def save_onboarding(payload: OnboardingPayload, client: Client = Depends(get_supabase_client)):
    """
    Persist user profile + preferences tied to Supabase auth user_id.
    """
    try:
        profile_resp = (
            client.table("user_profiles")
            .upsert(
                {
                    "user_id": payload.user_id,
                    "goals": payload.user_profiles.goals,
                    "main_objective": payload.user_profiles.main_objective,
                    "weekly_time": payload.user_profiles.weekly_time,
                },
                on_conflict="user_id",
            )
            .execute()
        )

        prefs_resp = (
            client.table("user_preferences")
            .upsert(
                {
                    "user_id": payload.user_id,
                    "skill_levels": payload.user_preferences.skill_levels,
                    "preferred_video_length": payload.user_preferences.preferred_video_length,
                    "learning_style": payload.user_preferences.learning_style,
                    "difficulty_preference": payload.user_preferences.difficulty_preference,
                },
                on_conflict="user_id",
            )
            .execute()
        )

    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save onboarding data: {exc}",
        ) from exc

    return {
        "status": "ok",
        "profile": profile_resp.data if profile_resp else None,
        "preferences": prefs_resp.data if prefs_resp else None,
    }
