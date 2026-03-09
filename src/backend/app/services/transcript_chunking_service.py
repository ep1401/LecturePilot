def split_transcript_into_chunks(
    snippets: list[dict],
    target_words: int = 180,
    max_words: int = 260,
) -> list[dict]:
    chunks = []

    current_texts: list[str] = []
    current_words = 0
    current_start = None

    for snippet in snippets:
        text = snippet.get("text", "").strip()
        if not text:
            continue

        words = text.split()
        if not words:
            continue

        if current_start is None:
            current_start = int(snippet["start"])

        current_texts.append(text)
        current_words += len(words)

        if current_words >= target_words:
            chunks.append(
                {
                    "content": " ".join(current_texts).strip(),
                    "timestamp_seconds": current_start,
                }
            )
            current_texts = []
            current_words = 0
            current_start = None

        elif current_words >= max_words:
            chunks.append(
                {
                    "content": " ".join(current_texts).strip(),
                    "timestamp_seconds": current_start,
                }
            )
            current_texts = []
            current_words = 0
            current_start = None

    if current_texts:
        chunks.append(
            {
                "content": " ".join(current_texts).strip(),
                "timestamp_seconds": current_start or 0,
            }
        )

    return chunks