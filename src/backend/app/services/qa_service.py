from openai import OpenAI

from app.core.config import settings

client = OpenAI(api_key=settings.openai_api_key)


def format_timestamp(seconds: int | None) -> str | None:
    if seconds is None:
        return None

    minutes = seconds // 60
    remaining_seconds = seconds % 60
    return f"{minutes}:{remaining_seconds:02d}"


def build_context(chunks: list[dict]) -> str:
    context_parts = []

    for i, chunk in enumerate(chunks, start=1):
        material_name = chunk.get("material_name", "Unknown material")
        page_number = chunk.get("page_number")
        timestamp_seconds = chunk.get("timestamp_seconds")
        content = chunk.get("content", "")

        if timestamp_seconds is not None:
            ts = format_timestamp(timestamp_seconds)
            source_label = f"{material_name} — {ts}"
        elif page_number is not None:
            source_label = f"{material_name} p. {page_number}"
        else:
            source_label = material_name

        context_parts.append(f"[Source {i}: {source_label}]\n{content}")

    return "\n\n".join(context_parts)


def embed_question(question: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=question,
    )
    return response.data[0].embedding


def generate_answer(question: str, chunks: list[dict]) -> str:
    context = build_context(chunks)

    prompt = f"""You are answering based ONLY on course materials.

Context:
{context}

Question:
{question}

Answer with sources. If the answer is not supported by the context, say that the course materials do not provide enough information.
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "You answer questions using only the provided course materials.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.2,
    )

    return response.choices[0].message.content or ""