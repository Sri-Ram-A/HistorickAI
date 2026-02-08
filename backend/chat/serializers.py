from rest_framework import serializers
from folders.models import Chunk,Folder,File

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
    type = serializers.ChoiceField(choices=["basic", "advanced", "question-bank"])
    topic = serializers.CharField(max_length=500, required=False, allow_blank=True)
    query = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    num_questions = serializers.IntegerField(default=10, required=False)
    difficulty = serializers.ChoiceField(choices=["easy", "medium", "hard"], required=False, allow_null=True)
    time_limit = serializers.IntegerField(required=False, allow_null=True)
    blooms = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    sources = SourcesSerializer()

class QuizResponseSerializer(serializers.Serializer):
    title = serializers.CharField()
    questions = serializers.ListField(child=serializers.DictField())

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
