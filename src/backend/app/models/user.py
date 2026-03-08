from pydantic import BaseModel
from typing import Optional


class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None