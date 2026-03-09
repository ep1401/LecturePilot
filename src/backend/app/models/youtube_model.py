from pydantic import BaseModel, HttpUrl


class YouTubeIngestRequest(BaseModel):
    url: HttpUrl
    title: str | None = None