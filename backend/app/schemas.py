from pydantic import BaseModel, Field, validator
from typing import List, Literal


class SectionNotes(BaseModel):
    title: str = Field(..., description="Section title")
    bullets: List[str] = Field(..., min_items=3, max_items=6, description="3-6 bullet points")


class QuizItem(BaseModel):
    question: str = Field(..., description="MCQ question")
    choices: List[str] = Field(..., min_items=4, max_items=4, description="Exactly 4 choices")
    answer_index: int = Field(..., ge=0, le=3, description="Index of correct answer (0-3)")
    explanation: str = Field(..., description="One-line explanation of correct answer")

    @validator('choices')
    def validate_choices_count(cls, v):
        if len(v) != 4:
            raise ValueError('Must have exactly 4 choices')
        return v


class MetaInfo(BaseModel):
    tokens_input: int = Field(0, description="Input tokens used")
    tokens_output: int = Field(0, description="Output tokens used")
    model: str = Field("gpt-4o-mini", description="LLM model used")


class GenerateResponse(BaseModel):
    notes: List[SectionNotes] = Field(..., min_items=3, max_items=6, description="3-6 revision sections")
    quiz: List[QuizItem] = Field(..., min_items=5, max_items=5, description="Exactly 5 MCQs")
    meta: MetaInfo = Field(..., description="Metadata about the generation")

    @validator('quiz')
    def validate_quiz_count(cls, v):
        if len(v) != 5:
            raise ValueError('Must have exactly 5 quiz items')
        return v
