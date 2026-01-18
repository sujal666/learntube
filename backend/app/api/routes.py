from fastapi import APIRouter

from app.core.config import get_settings
from app.api.v1.routes import router as v1_router

settings = get_settings()

api_router = APIRouter(prefix=settings.api_prefix)
api_router.include_router(v1_router)
