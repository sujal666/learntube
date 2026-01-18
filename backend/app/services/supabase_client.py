from functools import lru_cache
from supabase import Client, create_client

from app.core.config import get_settings


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """
    Return a cached Supabase client using the service role key for backend operations.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
