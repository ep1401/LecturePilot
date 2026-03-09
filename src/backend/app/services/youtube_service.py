import re
from urllib.parse import parse_qs, urlparse

from youtube_transcript_api import YouTubeTranscriptApi


def extract_video_id(url: str) -> str:
    parsed = urlparse(url)

    if parsed.netloc in {"youtu.be", "www.youtu.be"}:
        video_id = parsed.path.lstrip("/")
        if video_id:
            return video_id

    if parsed.netloc in {"youtube.com", "www.youtube.com", "m.youtube.com"}:
        if parsed.path == "/watch":
            query = parse_qs(parsed.query)
            video_id = query.get("v", [None])[0]
            if video_id:
                return video_id

        match = re.match(r"^/embed/([^/?]+)", parsed.path)
        if match:
            return match.group(1)

        match = re.match(r"^/shorts/([^/?]+)", parsed.path)
        if match:
            return match.group(1)

    raise ValueError("Invalid YouTube URL")


def fetch_transcript(video_id: str, languages: list[str] | None = None) -> list[dict]:
    languages = languages or ["en"]

    api = YouTubeTranscriptApi()
    fetched = api.fetch(video_id, languages=languages)

    snippets = []
    for snippet in fetched:
        snippets.append(
            {
                "text": snippet.text.strip(),
                "start": float(snippet.start),
                "duration": float(snippet.duration),
            }
        )

    return snippets