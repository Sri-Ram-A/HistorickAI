from pydantic import BaseModel,Field
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

class TimelineOutput(BaseModel):
    title: str = Field(description="Overall title for the timeline")
    events: List[TimelineEntry] = Field(description="Chronological list of events")
    
class DiagramOutput(BaseModel):
    """
    Output schema for diagram generation.
    Contains the title and Mermaid code for rendering.
    """
    title: str = Field(description="A clear, descriptive title for the diagram")
    code: str = Field(description="Valid Mermaid diagram code that can be rendered directly. Must follow Mermaid.js syntax exactly")