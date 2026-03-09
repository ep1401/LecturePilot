from pydantic import BaseModel
from typing import Literal


class QuizSource(BaseModel):
    material_name: str
    page_number: int | None = None
    timestamp_seconds: int | None = None
    chunk_id: str | None = None


class QuizQuestion(BaseModel):
    question_type: Literal["multiple_choice", "short_answer"]
    prompt: str
    options: list[str] = []
    correct_answer: str
    explanation: str
    sources: list[QuizSource]


class GradeQuizRequest(BaseModel):
    question: QuizQuestion
    user_answer: str


class GenerateQuizQuestionResponse(BaseModel):
    question: QuizQuestion


class GradeQuizResponse(BaseModel):
    is_correct: bool
    feedback: str
    correct_answer: str
    explanation: str
    sources: list[QuizSource]