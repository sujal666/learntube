from typing import List, Optional

from pydantic import BaseModel, Field


class YoutubeIngestRequest(BaseModel):
    topics: List[str] = Field(default_factory=list)
    max_results_per_topic: int = Field(5, ge=1, le=20)
    min_view_count: int = Field(0, ge=0)
    max_age_days: Optional[int] = Field(365, ge=1)
    refresh: bool = False
    order: str = Field("relevance", pattern="^(relevance|date)$")
    exclude_keywords: List[str] = Field(
        default_factory=lambda: ["trailer", "official music video", "lyrics", "remix", "promo"]
    )


class YoutubeIngestResponse(BaseModel):
    inserted: int
    attempted: int
    skipped: int
    topics: List[str]
    video_ids: List[str] = Field(default_factory=list)
