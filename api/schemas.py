from pydantic import BaseModel

class Story(BaseModel):
    script: str
    scenes: list[str]

class TimelineEntry(BaseModel):
    title: str
    heading: str
    description: str
    image_source: str
    alternative: str
    
class Quiz(BaseModel):
    question: str
    options: list[str]
    correctAnswer: str
