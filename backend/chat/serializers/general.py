from rest_framework import serializers
from folders.models import Chunk,Folder

# Chunk Retrieval Serializers
class RetrieveRequestSerializer(serializers.Serializer):
    folder_id = serializers.UUIDField()
    query = serializers.CharField()

class ChunkResultSerializer(serializers.ModelSerializer):
    score = serializers.FloatField(read_only=True)
    class Meta:
        model = Chunk
        fields = ["id","text","metadata","score","score"]

class RetrieveResponseSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    results = ChunkResultSerializer(many=True)

# Timeline Serializers
class TimelineRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=1000)

class TimelineItemSerializer(serializers.Serializer):
    title = serializers.CharField()
    heading = serializers.CharField()
    description = serializers.CharField()
    image_source = serializers.CharField()
    alternative = serializers.CharField()

class TimelineResponseSerializer(serializers.Serializer):
    response = TimelineItemSerializer(many=True)

# Flowchart Diagram Serializers
class DiagramRequestSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=["flowchart","sequence","gantt","class","git","er","journey","quadrant","xy"],required=True,help_text="Type of diagram to generate")
    query = serializers.CharField(max_length=2000,required=True,help_text="Description of the diagram to generate")

    def validate_query(self, value):
        if not value.strip():
            raise serializers.ValidationError("Query cannot be empty")
        return value.strip()

class DiagramResponseSerializer(serializers.Serializer):
    title = serializers.CharField(help_text="Title of the generated diagram")
    code = serializers.CharField(help_text="Mermaid diagram code")

# Quiz Preparation Serializers
class SourcesSerializer(serializers.Serializer):
    folders = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )
    files = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )

class QuizRequestSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=["basic", "advanced", "question-bank"],required=True)
    topic = serializers.CharField(max_length=500,required=False,allow_blank=True,allow_null=True)
    query = serializers.CharField(max_length=1000,required=False,allow_blank=False,allow_null=False)
    num_questions = serializers.IntegerField(default=10,required=False,min_value=1,max_value=50)
    difficulty = serializers.ChoiceField(choices=["easy", "medium", "hard"],required=False,allow_null=True)
    time_limit = serializers.IntegerField(required=False,allow_null=True,min_value=1,help_text="Time limit in minutes")
    blooms = serializers.ListField(
        child=serializers.ChoiceField(choices=[
            "remember", "understand", "apply",
            "analyze", "evaluate", "create"
        ]),
        required=False,
        default=list
    )
    sources = SourcesSerializer(required=True)

class QuizResponseSerializer(serializers.Serializer):
    title = serializers.CharField()
    questions = serializers.ListField(child=serializers.DictField())

# Quiz Evaluation Serializers
class EvaluateAnswersRequestSerializer(serializers.Serializer):
    questions = serializers.ListField(child=serializers.DictField())
    answers = serializers.DictField()
    config = serializers.DictField()

class EvaluateAnswersResponseSerializer(serializers.Serializer):
    total_marks = serializers.IntegerField()
    obtained_marks = serializers.FloatField()
    percentage = serializers.FloatField()
    feedback = serializers.ListField(child=serializers.DictField())

