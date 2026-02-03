from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from pgvector.django import CosineDistance
from drf_spectacular.utils import extend_schema
from . import serializers
from folders.models import Folder, Chunk
from folders.signals import embedding_model

# Create your views here.
TOP_K = 5
# 6883855c-b1e0-4c57-ad39-de8b01124c41
@extend_schema(tags=["Chat"])
class RetrieveChunksView(APIView):
    serializer_class = serializers.RetrieveRequestSerializer
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        folder_id = serializer.validated_data["folder_id"]
        query = serializer.validated_data["query"]

        folder = get_object_or_404(Folder, id=folder_id)
        query_embedding = embedding_model.encode(query,normalize_embeddings=True).tolist()

        chunks = (
            Chunk.objects
            .filter(folder=folder)
            .annotate(score=CosineDistance("embedding", query_embedding))
            .order_by("score")[:TOP_K]
        )

        results = serializers.ChunkResultSerializer(chunks, many=True).data

        return Response({
            "count": len(results),
            "results": results
        }, status=status.HTTP_200_OK)

