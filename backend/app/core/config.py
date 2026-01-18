from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "LearnTube API"
    api_prefix: str = "/api"
    supabase_url: str
    supabase_service_role_key: str
    supabase_anon_key: str | None = None
    environment: str = "local"
    redis_url: str = "redis://localhost:6379/0"
    openai_api_key: str | None = None
    huggingface_api_key: str | None = None
    youtube_api_key: str | None = None
    langfuse_host: str | None = None
    langfuse_public_key: str | None = None
    langfuse_secret_key: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
