from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.core.config import get_settings


def get_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name)
    allowed_origins = [
        "http://localhost:3000",
        "https://localhost:3000",
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router)
    return app


app = get_app()
