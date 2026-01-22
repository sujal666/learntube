from fastapi import APIRouter, Depends
from supabase import Client

from app.api.v1.enrich_videos import router as enrich_router
from app.api.v1.ingest_youtube import router as ingest_youtube_router
from app.api.v1.onboarding import router as onboarding_router
from app.core.config import get_settings
from app.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/v1")

router.include_router(onboarding_router)
router.include_router(ingest_youtube_router)
router.include_router(enrich_router)


@router.get("/health", tags=["health"])
def healthcheck():
    settings = get_settings()
    return {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.environment,
    }


@router.get("/health/supabase", tags=["health"])
def supabase_config(client: Client = Depends(get_supabase_client)):
    settings = get_settings()
    return {
        "status": "configured",
        "supabase_url": settings.supabase_url,
        "uses_service_role": bool(settings.supabase_service_role_key),
        "client_initialized": isinstance(client, Client),
    }
