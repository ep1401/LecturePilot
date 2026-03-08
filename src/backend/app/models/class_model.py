from datetime import datetime
from pydantic import BaseModel


class CreateClassRequest(BaseModel):
    name: str


class ClassResponse(BaseModel):
    id: str
    user_id: str
    name: str
    created_at: datetime