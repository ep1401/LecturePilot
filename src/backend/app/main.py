from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.classes import router as classes_router
from app.api.routes.health import router as health_router
from app.api.routes.materials import router as materials_router
from app.core.config import settings
from app.api.routes.ask import router as ask_router

app = FastAPI(title="LecturePilot Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(classes_router, prefix="/api")
app.include_router(materials_router, prefix="/api")
app.include_router(ask_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Backend is running"}