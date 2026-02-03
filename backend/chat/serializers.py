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
