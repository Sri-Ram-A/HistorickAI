from rest_framework import serializers
from folders.models import Chunk

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

class QuizRequestSerializer(serializers.Serializer):
    topic = serializers.CharField(max_length=500)

class QuizItemSerializer(serializers.Serializer):
    question = serializers.CharField()
    options = serializers.ListField(child=serializers.CharField())
    answer = serializers.CharField()

class QuizResponseSerializer(serializers.Serializer):
    quizzes = QuizItemSerializer(many=True)

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
