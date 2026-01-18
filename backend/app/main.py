from fastapi import FastAPI

from app.api.routes import api_router
from app.core.config import get_settings


def get_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name)
    app.include_router(api_router)
    return app


app = get_app()
