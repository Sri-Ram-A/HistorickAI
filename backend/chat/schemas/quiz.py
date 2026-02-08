from pydantic import BaseModel,RootModel
from typing import List, Literal, Union

class BasicQuiz(BaseModel):
    question: str
    options: list[str]
    answer: str

QuestionType = Literal["mcq","fill_blank","short","long"]

class BaseQuestion(BaseModel):
    id: str
    type: QuestionType
    question: str
    marks: int = 1
    difficulty: Literal["easy", "medium", "hard"]
    blooms: Literal["remember","understand","apply","analyze","evaluate","create"]
    explanation: str | None = None
    source:str

class MCQ(BaseQuestion):
    type: QuestionType = "mcq"
    options: List[str]
    answer: int

class FillBlank(BaseQuestion):
    type: QuestionType = "fill_blank"
    answer: str

class ShortAnswer(BaseQuestion):
    type: QuestionType = "short"
    answer: str
    keywords: List[str] = []

class LongAnswer(BaseQuestion):
    type: QuestionType = "long"
    rubric: List[str]
    answer: str

Question = Union[MCQ,FillBlank,ShortAnswer,LongAnswer]

class QuestionFeedback(BaseModel):
    question_id: str
    marks_obtained: float
    max_marks: int
    feedback: str
    correct: bool | None = None  # For objective questions

class EvaluationResult(BaseModel):
    obtained_marks: float
    feedback: List[QuestionFeedback]
    
