from pydantic import BaseModel, Field, field_validator
from typing import Literal, List, Union, Generic, TypeVar, Optional

# STYLE TYPES (from tldraw documentation)
Color = Literal[
    "black", "grey", "light-violet", "violet", "blue", "light-blue",
    "yellow", "orange", "green", "light-green", "light-red", "red", "white"
]
FillStyle = Literal["none", "semi", "solid", "pattern"]
DashStyle = Literal["draw", "solid", "dashed", "dotted"]
SizeStyle = Literal["s", "m", "l", "xl"]
FontStyle = Literal["draw", "sans", "serif", "mono"]
HorizontalAlignStyle = Literal["start", "middle", "end"]
VerticalAlignStyle = Literal["start", "middle", "end"]
ShapeType = Literal["geo", "text", "note", "arrow"]

# Geo shape types - all 20 geometric forms
GeoType = Literal[
    # Basic shapes
    "rectangle", "ellipse", "triangle", "diamond", "oval",
    # Polygons
    "pentagon", "hexagon", "octagon", "star",
    # Parallelograms
    "rhombus", "rhombus-2", "trapezoid",
    # Directional arrows
    "arrow-up", "arrow-down", "arrow-left", "arrow-right",
    # Special shapes
    "cloud", "heart", "x-box", "check-box"
]
# BASE SHAPE
P = TypeVar("P")
class TLBaseShape(BaseModel, Generic[P]):
    """
    Base shape for all tldraw shapes.
    Reference: https://tldraw.dev/sdk-features/shapes
    All shapes extend TLBaseShape which defines common properties:
    - Unique identifier (id)
    - Position (x, y) and rotation
    - Z-ordering index
    - Parent reference
    - Props field for shape-specific properties
    """
    id: str = Field(..., description="Unique shape identifier")
    type: ShapeType = Field(..., description="Shape type")
    x: float = Field(..., description="X position on canvas")
    y: float = Field(..., description="Y position on canvas")
    rotation: float = Field(default=0, description="Rotation in radians")
    props: P = Field(..., description="Shape-specific properties")
    
    @field_validator("id", mode="before")
    @classmethod
    def ensure_shape_prefix(cls, v: str) -> str:
        """Ensure ID has 'shape:' prefix as per tldraw convention"""
        return v if v.startswith("shape:") else f"shape:{v}"

# GEO SHAPE (rectangles, ellipses, stars, clouds, etc.)
class GeoProps(BaseModel):
    """
    Properties for geo shapes.
    Reference: https://tldraw.dev/sdk-features/geo-shape
    """
    geo: GeoType = Field(default="rectangle", description="Geometric form type")
    w: float = Field(..., ge=0, description="Width in pixels")
    h: float = Field(..., ge=0, description="Height in pixels")
    color: Color = Field(default="black", description="Stroke/outline color")
    labelColor: Color = Field(default="black", description="Text label color")
    fill: FillStyle = Field(default="none", description="Fill style")
    dash: DashStyle = Field(default="draw", description="Stroke pattern")
    size: SizeStyle = Field(default="m", description="Size preset affecting stroke width")
    font: FontStyle = Field(default="draw", description="Font family for label")
    text: str = Field(default="", description="Plain text label (legacy)")
    align: HorizontalAlignStyle = Field(default="middle", description="Horizontal text alignment")
    verticalAlign: VerticalAlignStyle = Field(default="middle", description="Vertical text alignment")
    growY: float = Field(default=0, description="Additional vertical space for text overflow")
    url: str = Field(default="", description="Optional hyperlink URL")
    scale: float = Field(default=1, description="Scale factor")

class GeoShape(TLBaseShape[GeoProps]):
    """Geometric shape - supports 20 different forms including rectangles, ellipses, stars, clouds, etc."""
    type: ShapeType = "geo"

# TEXT SHAPE
class TextProps(BaseModel):
    """
    Properties for text shapes.
    Reference: https://tldraw.dev/reference/tldraw/TextShapeUtil
    """
    text: str = Field(default="", description="Plain text content (legacy)")
    color: Color = Field(default="black", description="Text color")
    size: SizeStyle = Field(default="m", description="Font size preset")
    font: FontStyle = Field(default="draw", description="Font family")
    textAlign: HorizontalAlignStyle = Field(default="start", description="Text alignment")
    w: float = Field(default=200, description="Width in pixels")
    autoSize: bool = Field(default=True, description="Auto-resize based on content")
    scale: float = Field(default=1, description="Scale factor")

class TextShape(TLBaseShape[TextProps]):
    """Standalone text shape"""
    type: ShapeType = "text"

# NOTE SHAPE (sticky note)
class NoteProps(BaseModel):
    """
    Properties for note/sticky shapes.
    Reference: https://tldraw.dev/sdk-features/note-shape
    """
    text: str = Field(default="", description="Note text content")
    color: Color = Field(default="yellow", description="Note background color")
    size: SizeStyle = Field(default="m", description="Font size")
    font: FontStyle = Field(default="draw", description="Font family")
    align: HorizontalAlignStyle = Field(default="middle", description="Horizontal alignment")
    verticalAlign: VerticalAlignStyle = Field(default="middle", description="Vertical alignment")
    url: str = Field(default="", description="Optional URL")
    scale: float = Field(default=1, description="Scale factor")

class NoteShape(TLBaseShape[NoteProps]):
    """Sticky note shape"""
    type:ShapeType = "note"

# ARROW SHAPE
class ArrowProps(BaseModel):
    """
    Properties for arrow shapes.
    Arrows can connect shapes or be freestanding.
    """
    color: Color = Field(default="black", description="Arrow color")
    fill: FillStyle = Field(default="none", description="Fill style")
    dash: DashStyle = Field(default="draw", description="Line style")
    size: SizeStyle = Field(default="m", description="Thickness")
    # Arrow terminals (bindings to other shapes)
    start: dict = Field(default_factory=dict, description="Start point or binding")
    end: dict = Field(default_factory=dict, description="End point or binding")
    bend: float = Field(default=0, description="Curvature amount")
    text: str = Field(default="", description="Label text")
    labelColor: Color = Field(default="black", description="Label color")
    font: FontStyle = Field(default="draw", description="Label font")
    scale: float = Field(default=1, description="Scale factor")
    # Arrow head styles
    arrowheadStart: Literal["none", "arrow", "triangle", "square", "dot", "diamond", "inverted", "bar", "pipe"] = Field(default="none", description="Start arrowhead type")
    arrowheadEnd: Literal["none", "arrow", "triangle", "square", "dot", "diamond", "inverted", "bar", "pipe"] = Field(default="arrow", description="End arrowhead type")

class ArrowShape(TLBaseShape[ArrowProps]):
    """Arrow/connector shape"""
    type: ShapeType = "arrow"

# TOP-LEVEL DIAGRAM
Shape = Union[GeoShape, TextShape, NoteShape, ArrowShape]
class TldrawDiagram(BaseModel):
    """
    Complete tldraw diagram with multiple shapes.
    The backend can generate this and the frontend will render it.
    """
    shapes: List[Shape] = Field(..., description="List of shapes to render")
    
    class Config:
        json_schema_extra = {
            "example": {
                "shapes": [
                    {
                        "id": "shape:box1",
                        "type": "geo",
                        "x": 100,
                        "y": 100,
                        "rotation": 0,
                        "props": {
                            "geo": "rectangle",
                            "w": 200,
                            "h": 150,
                            "color": "blue",
                            "fill": "solid",
                            "text": "Process Step"
                        }
                    },
                    {
                        "id": "shape:arrow1",
                        "type": "arrow",
                        "x": 300,
                        "y": 175,
                        "rotation": 0,
                        "props": {
                            "color": "black",
                            "start": {"x": 0, "y": 0},
                            "end": {"x": 100, "y": 0}
                        }
                    }
                ]
            }
        }
        