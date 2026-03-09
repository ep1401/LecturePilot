from pydantic import BaseModel


class GenerateFlashcardsRequest(BaseModel):
    material_id: str | None = None
    count: int = 10


class FlashcardSourceResponse(BaseModel):
    material_name: str
    page_number: int | None = None
    timestamp_seconds: int | None = None
    chunk_id: str | None = None


class FlashcardResponse(BaseModel):
    id: str
    class_id: str
    material_id: str | None = None
    front: str
    back: str
    starred: bool = False
    sources: list[FlashcardSourceResponse]


class ToggleStarRequest(BaseModel):
    starred: bool