from pydantic import BaseModel,RootModel
from typing import List

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
    answer: str

