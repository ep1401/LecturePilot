from openai import OpenAI

from app.core.config import settings

client = OpenAI(api_key=settings.openai_api_key)


def embed_question(question: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=question,
    )
    return response.data[0].embedding


def build_context(chunks: list[dict]) -> str:
    context_parts = []

    for i, chunk in enumerate(chunks, start=1):
        material_name = chunk.get("material_name", "Unknown material")
        page_number = chunk.get("page_number")
        content = chunk.get("content", "")

        source_label = f"{material_name}"
        if page_number is not None:
            source_label += f" p. {page_number}"

        context_parts.append(
            f"[Source {i}: {source_label}]\n{content}"
        )

    return "\n\n".join(context_parts)


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