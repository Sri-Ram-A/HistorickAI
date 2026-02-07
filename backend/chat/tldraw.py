from pydantic import BaseModel, Field, field_validator
from typing import Literal, List, Union

# RichText document
class RichText(BaseModel):
    type: Literal["doc"] = "doc"
    content: List[dict]

# Base shape
class ShapeBase(BaseModel):
    id: str
    type: str
    x: float
    y: float
    rotation: float = 0
    props: dict

    @field_validator("id", mode="before")
    @classmethod
    def prefix_shape_id(cls, v: str):
        if not v.startswith("shape:"):
            return f"shape:{v}"
        return v

# Geo props
class GeoProps(BaseModel):
    geo: Literal["rectangle", "ellipse"]
    w: float
    h: float
    fill: Literal["none","semi","solid","pattern","fill","lined-fill"]
    color: Literal[
        "black","grey","light-violet","violet","blue","light-blue",
        "yellow","orange","green","light-green","light-red","red","white"
    ]

class GeoShape(ShapeBase):
    type: Literal["geo"] = "geo"
    props: GeoProps

# Text props (richText required)
class TextProps(BaseModel):
    richText: RichText
    size: Literal["s","m","l","xl"]
    color: Literal[
        "black","grey","light-violet","violet","blue","light-blue",
        "yellow","orange","green","light-green","light-red","red","white"
    ]
    autoSize: bool = True

class TextShape(ShapeBase):
    type: Literal["text"] = "text"
    props: TextProps

# Note props (richText required)
class NoteProps(BaseModel):
    richText: RichText
    color: Literal[
        "black","grey","light-violet","violet","blue","light-blue",
        "yellow","orange","green","light-green","light-red","red","white"
    ]
    size: Literal["s","m","l","xl"] = "m"

class NoteShape(ShapeBase):
    type: Literal["note"] = "note"
    props: NoteProps

# Arrow props
class ArrowProps(BaseModel):
    startX: float
    startY: float
    endX: float
    endY: float
    color: Literal[
        "black","grey","light-violet","violet","blue","light-blue",
        "yellow","orange","green","light-green","light-red","red","white"
    ]

class ArrowShape(ShapeBase):
    type: Literal["arrow"] = "arrow"
    props: ArrowProps

# Top-level response
class TldrawDiagram(BaseModel):
    shapes: List[Union[GeoShape, TextShape, NoteShape, ArrowShape]]
