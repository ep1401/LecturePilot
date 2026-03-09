from datetime import datetime
from pydantic import BaseModel


class MaterialResponse(BaseModel):
    id: str
    class_id: str
    type: str
    name: str
    storage_path: str | None = None
    created_at: datetime