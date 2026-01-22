from typing import List, Optional

from pydantic import BaseModel


class VideoEnrichmentResult(BaseModel):
    video_id: str
    difficulty: str
    difficulty_confidence: float
    sentiment_score: Optional[float]
    comment_count_analyzed: int
    topic_tags: List[str]
