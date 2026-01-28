import os
from functools import lru_cache
from typing import Optional

from app.core.config import get_settings

try:
    from langfuse import get_client as _langfuse_get_client
except Exception:  # pragma: no cover
    _langfuse_get_client = None


@lru_cache(maxsize=1)
def get_langfuse_client():
    settings = get_settings()
    if not (
        settings.langfuse_public_key and settings.langfuse_secret_key
    ):
        return None

    if _langfuse_get_client is None:
        return None

    os.environ.setdefault("LANGFUSE_PUBLIC_KEY", settings.langfuse_public_key)
    os.environ.setdefault("LANGFUSE_SECRET_KEY", settings.langfuse_secret_key)
    os.environ.setdefault(
        "LANGFUSE_HOST",
        settings.langfuse_host or "https://cloud.langfuse.com",
    )

    return _langfuse_get_client()
