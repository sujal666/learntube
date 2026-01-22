from functools import lru_cache
from typing import Dict, List, Optional

from transformers import pipeline

from app.core.config import get_settings

DIFFICULTY_LABELS = ["Beginner", "Intermediate", "Advanced"]
TOPIC_CANDIDATES = [
    "React Hooks",
    "Machine Learning Basics",
    "FastAPI",
    "Python Basics",
    "AI/ML",
    "Web Development",
    "Data Science",
    "Cloud",
    "DevOps",
    "SQL",
    "Design Systems",
]


@lru_cache(maxsize=1)
def _get_zero_shot_classifier():
    return pipeline("zero-shot-classification", model="facebook/bart-large-mnli")


@lru_cache(maxsize=1)
def _get_sentiment_analyzer():
    return pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment")


def classify_difficulty(text: str) -> Dict[str, float]:
    classifier = _get_zero_shot_classifier()
    candidate_labels = DIFFICULTY_LABELS
    if not text:
        return {"label": "Intermediate", "score": 0.5}

    result = classifier(
        text,
        candidate_labels,
        hypothesis_template="This text is {} level.",
    )
    label = result["labels"][0]
    score = result["scores"][0]
    return {"label": label, "score": float(score)}


def extract_topics(text: str, max_tags: int = 3, threshold: float = 0.25) -> List[str]:
    if not text:
        return []
    classifier = _get_zero_shot_classifier()
    result = classifier(
        text,
        TOPIC_CANDIDATES,
        hypothesis_template="This text is about {}.",
        multi_label=True,
    )
    topics = []
    for label, score in zip(result["labels"], result["scores"]):
        if len(topics) >= max_tags:
            break
        if score >= threshold:
            topics.append(label)
    return topics


def analyze_comments_sentiment(comments: List[str]) -> Dict[str, Optional[float]]:
    analyzer = _get_sentiment_analyzer()
    if not comments:
        return {"score": None, "count": 0}

    preds = analyzer(comments, truncation=True)
    positive = sum(
        1
        for pred in preds
        if pred.get("label", "").lower().startswith("positive")
    )
    ratio = positive / len(preds) if preds else 0.0
    return {"score": float(ratio), "count": len(preds)}
