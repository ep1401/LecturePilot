import json
import random
from openai import OpenAI

from app.core.config import settings

client = OpenAI(api_key=settings.openai_api_key)


def format_source_label(source: dict) -> str:
    material_name = source.get("material_name", "Unknown material")
    page_number = source.get("page_number")
    timestamp_seconds = source.get("timestamp_seconds")

    if timestamp_seconds is not None:
        minutes = timestamp_seconds // 60
        seconds = timestamp_seconds % 60
        return f"{material_name} — {minutes}:{seconds:02d}"

    if page_number is not None:
        return f"{material_name} p. {page_number}"

    return material_name


def build_quiz_context(chunks: list[dict]) -> str:
    parts = []

    for idx, chunk in enumerate(chunks, start=1):
        label = format_source_label(chunk)
        parts.append(
            f"[Chunk {idx}: {label}]\n{chunk.get('content', '')}"
        )

    return "\n\n".join(parts)


def generate_quiz_question(chunks: list[dict]) -> dict:
    context = build_quiz_context(chunks)

    prompt = f"""
You are creating exactly ONE quiz question based ONLY on the course material below.

Context:
{context}

Requirements:
- Create either a "multiple_choice" question or a "short_answer" question.
- The question must be answerable only from the provided context.
- If multiple_choice, provide exactly 4 answer options.
- Include the correct answer.
- Include a short explanation.
- Include sources using the chunk numbers you relied on.
- Return valid JSON only.

JSON format:
{{
  "question_type": "multiple_choice" or "short_answer",
  "prompt": "question text",
  "options": ["A", "B", "C", "D"],
  "correct_answer": "correct answer text",
  "explanation": "short explanation",
  "source_indices": [1, 2]
}}
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "You generate quiz questions strictly from provided course material and return valid JSON only.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.7,
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content or "{}")

    source_indices = data.get("source_indices", [])
    sources = []

    for i in source_indices:
        if isinstance(i, int) and 1 <= i <= len(chunks):
            chunk = chunks[i - 1]
            sources.append(
                {
                    "material_name": chunk.get("material_name"),
                    "page_number": chunk.get("page_number"),
                    "timestamp_seconds": chunk.get("timestamp_seconds"),
                    "chunk_id": chunk.get("id"),
                }
            )

    return {
        "question_type": data.get("question_type", "short_answer"),
        "prompt": data.get("prompt", "What does the material say?"),
        "options": data.get("options", []) if data.get("question_type") == "multiple_choice" else [],
        "correct_answer": data.get("correct_answer", ""),
        "explanation": data.get("explanation", ""),
        "sources": sources,
    }


def grade_quiz_answer(question: dict, user_answer: str) -> dict:
    question_type = question.get("question_type")
    correct_answer = question.get("correct_answer", "").strip()
    explanation = question.get("explanation", "")
    sources = question.get("sources", [])

    if question_type == "multiple_choice":
        is_correct = user_answer.strip().lower() == correct_answer.strip().lower()
        feedback = (
            "Correct." if is_correct else "Not quite."
        )
        return {
            "is_correct": is_correct,
            "feedback": feedback,
            "correct_answer": correct_answer,
            "explanation": explanation,
            "sources": sources,
        }

    prompt = f"""
You are grading a student's short-answer response.

Question:
{question.get("prompt", "")}

Correct answer:
{correct_answer}

Student answer:
{user_answer}

Return valid JSON only in this format:
{{
  "is_correct": true or false,
  "feedback": "one short sentence"
}}

Mark the answer correct if it is meaningfully equivalent, even if wording differs.
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "You grade short answers fairly and return valid JSON only.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0,
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content or "{}")

    return {
        "is_correct": bool(data.get("is_correct", False)),
        "feedback": data.get("feedback", "Here is the result."),
        "correct_answer": correct_answer,
        "explanation": explanation,
        "sources": sources,
    }


def select_quiz_chunks(chunks: list[dict], k: int = 5) -> list[dict]:
    if len(chunks) <= k:
        return chunks
    return random.sample(chunks, k)