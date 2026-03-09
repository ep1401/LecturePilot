from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "lecturepilot",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.material_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/New_York",
    enable_utc=True,
)