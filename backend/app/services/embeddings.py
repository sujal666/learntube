from functools import lru_cache
from typing import List

from sentence_transformers import SentenceTransformer


@lru_cache(maxsize=1)
def _get_embedder() -> SentenceTransformer:
    return SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def embed_text(text: str) -> List[float]:
    if not text:
        return []
    model = _get_embedder()
    return model.encode(text, normalize_embeddings=True).tolist()
