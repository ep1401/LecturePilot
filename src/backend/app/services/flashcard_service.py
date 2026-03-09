import json
from math import ceil
from openai import OpenAI

from app.core.config import settings

client = OpenAI(api_key=settings.openai_api_key)


def format_source_label(chunk: dict) -> str:
    material_name = chunk.get("material_name", "Course material")
    timestamp_seconds = chunk.get("timestamp_seconds")
    page_number = chunk.get("page_number")

    if timestamp_seconds is not None:
        minutes = timestamp_seconds // 60
        seconds = timestamp_seconds % 60
        return f"{material_name} — {minutes}:{seconds:02d}"

    if page_number is not None:
        return f"{material_name} p. {page_number}"

    return material_name


def build_flashcard_context(chunks: list[dict]) -> str:
    parts = []

    for idx, chunk in enumerate(chunks, start=1):
        parts.append(
            f"[Chunk {idx}: {format_source_label(chunk)}]\n{chunk.get('content', '')}"
        )

    return "\n\n".join(parts)


def estimate_flashcard_count(chunks: list[dict]) -> int:
    """
    Make count vary with material size, but stay bounded.
    """
    total_words = 0
    for chunk in chunks:
        total_words += len((chunk.get("content") or "").split())

    # Rough heuristic:
    # ~1 flashcard per 120 words, clamped to a reasonable range
    estimated = ceil(total_words / 120) if total_words > 0 else 4
    return max(4, min(estimated, 24))


def generate_flashcards_from_chunks(chunks: list[dict]) -> list[dict]:
    count = estimate_flashcard_count(chunks)
    context = build_flashcard_context(chunks)

    prompt = f"""
You are generating study flashcards using ONLY the course material below.

Context:
{context}

Requirements:
- Generate as many flashcards as needed to cover the important material well.
- Target around {count} flashcards.
- Do not force a fixed count if fewer high-quality cards make more sense.
- Avoid redundancy.
- Prioritize definitions, concepts, methods, relationships, and important facts.
- Each flashcard must have:
  - "front": a concise prompt/question/term
  - "back": the answer/explanation
  - "source_indices": a list of chunk numbers used
- Return valid JSON only.

JSON format:
{{
  "flashcards": [
    {{
      "front": "What is ...?",
      "back": "It is ...",
      "source_indices": [1, 3]
    }}
  ]
}}
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "You generate concise, accurate study flashcards from provided course material and return valid JSON only.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.4,
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content or "{}")
    raw_cards = data.get("flashcards", [])

    cards = []
    for raw in raw_cards:
        indices = raw.get("source_indices", [])
        sources = []

        for i in indices:
            if isinstance(i, int) and 1 <= i <= len(chunks):
                chunk = chunks[i - 1]
                sources.append(
                    {
                        "chunk_id": chunk.get("id"),
                        "material_name": chunk.get("material_name", "Course material"),
                        "page_number": chunk.get("page_number"),
                        "timestamp_seconds": chunk.get("timestamp_seconds"),
                    }
                )

        cards.append(
            {
                "front": raw.get("front", "").strip(),
                "back": raw.get("back", "").strip(),
                "sources": sources,
            }
        )

    return [card for card in cards if card["front"] and card["back"]]