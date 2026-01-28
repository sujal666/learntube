from collections import Counter
from typing import Optional

from supabase import Client


def adjust_preferences_with_feedback(
    client: Client,
    user_id: str,
    difficulty_filter: Optional[str],
    min_sentiment: float,
) -> tuple[Optional[str], float]:
    """
    Simple rule-based adjustments based on past feedback.
    too_easy  -> bias toward harder content
    too_hard  -> bias toward easier content
    not_helpful -> raise sentiment threshold slightly
    helpful -> lower sentiment threshold slightly
    """
    try:
        resp = (
            client.table("recommendation_feedback")
            .select("feedback_type")
            .eq("user_id", user_id)
            .execute()
        )
        rows = resp.data or []
    except Exception:
        return difficulty_filter, min_sentiment

    counts = Counter(row.get("feedback_type") for row in rows)

    too_easy = counts.get("too_easy", 0)
    too_hard = counts.get("too_hard", 0)
    helpful = counts.get("helpful", 0)
    not_helpful = counts.get("not_helpful", 0)

    # Difficulty adjustment
    if too_easy > too_hard:
        difficulty_filter = difficulty_filter or "Advanced"
    elif too_hard > too_easy:
        difficulty_filter = difficulty_filter or "Beginner"

    # Sentiment tweak
    min_sentiment = float(min_sentiment)
    if helpful > not_helpful:
        min_sentiment = max(0.0, min_sentiment - 0.05)
    elif not_helpful > helpful:
        min_sentiment = min(1.0, min_sentiment + 0.05)

    return difficulty_filter, min_sentiment
