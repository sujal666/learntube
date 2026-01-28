from typing import Dict, Optional

import openai

from app.core.config import get_settings
from app.services.langfuse_monitor import get_langfuse_client


def build_context_payload(
    user_id: str,
    user_profile: Dict,
    user_preferences: Dict,
    user_embedding: Optional[Dict],
    video: Dict,
    recommendation_meta: Dict,
) -> Dict[str, object]:
    return {
        "user_id": user_id,
        "goals": user_profile.get("goals") or [],
        "main_objective": user_profile.get("main_objective"),
        "weekly_time": user_profile.get("weekly_time"),
        "skill_levels": user_preferences.get("skill_levels") or [],
        "learning_style": user_preferences.get("learning_style"),
        "difficulty_preference": user_preferences.get("difficulty_preference"),
        "user_embedding_created_at": user_embedding.get("created_at") if user_embedding else None,
        "video": {
            "video_id": video.get("video_id"),
            "title": video.get("title"),
            "description": video.get("description"),
            "topics": video.get("topic_tags") or [],
            "difficulty": video.get("difficulty"),
            "sentiment_score": video.get("sentiment_score"),
        },
        "recommendation": recommendation_meta,
    }


def generate_explanation(context: Dict[str, object]) -> Dict[str, object]:
    settings = get_settings()
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured.")

    openai.api_key = settings.openai_api_key
    system = (
        "You are an assistant that explains recommendation decisions."
        " Use only the provided context (user goals, onboarding, video metadata, similarity/difficulty/sentiment) and keep the explanation concise."
    )
    prompt = f"""
User profile:
- Goals: {context['goals']}
- Objective: {context['main_objective']}
- Skill levels: {context['skill_levels']}
- Learning style: {context['learning_style']}

Video:
- Title: {context['video']['title']}
- Topics: {context['video']['topics']}
- Difficulty: {context['video']['difficulty']}
- Sentiment score: {context['video']['sentiment_score']}

Recommendation metadata:
- Similarity: {context['recommendation'].get('similarity')}
- Sentiment filter: {context['recommendation'].get('min_sentiment')}
- Difficulty filter: {context['recommendation'].get('difficulty_filter')}

Explain in a short paragraph why this video makes sense, referencing the user goals, NLP signals, and similarity result.
"""

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": prompt},
    ]

    langfuse_client = get_langfuse_client()
    generation_metadata = {
        "user_id": context["user_id"],
        "video_id": context["video"]["video_id"],
        "similarity": context["recommendation"].get("similarity"),
    }

    def call_model():
        return openai.chat.completions.create(
            model=settings.explanation_model,
            messages=messages,
            temperature=settings.explanation_temperature,
        )

    if langfuse_client:
        with langfuse_client.start_as_current_observation(
            name="recommendation-explanation",
            as_type="generation",
            metadata=generation_metadata,
            model=settings.explanation_model,
            input={"messages": messages},
        ) as generation:
            response = call_model()
            explanation = response.choices[0].message.content.strip()
            usage = response.usage or {}
            generation.update(
                output=explanation,
                usage_details={
                    "prompt_tokens": usage.get("prompt_tokens"),
                    "completion_tokens": usage.get("completion_tokens"),
                    "total_tokens": usage.get("total_tokens"),
                },
            )
    else:
        response = call_model()
        explanation = response.choices[0].message.content.strip()
        usage = response.usage or {}

    return {
        "explanation": explanation,
        "usage": usage,
        "context": context,
    }
