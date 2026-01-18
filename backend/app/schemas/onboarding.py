from typing import List

from pydantic import BaseModel


class UserProfileInput(BaseModel):
    goals: List[str] = []
    main_objective: str
    weekly_time: str


class UserPreferencesInput(BaseModel):
    skill_levels: List[str] = []
    preferred_video_length: str
    learning_style: str
    difficulty_preference: str


class OnboardingPayload(BaseModel):
    user_id: str
    user_profiles: UserProfileInput
    user_preferences: UserPreferencesInput
