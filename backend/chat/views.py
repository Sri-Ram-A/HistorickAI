from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from pgvector.django import CosineDistance
from drf_spectacular.utils import extend_schema

from folders.models import Folder, Chunk
from folders.signals import embedding_model
from . import model,schemas,system_instructions,serializers
import json
from loguru import logger
# Create your views here.
TOP_K = 5
# 6883855c-b1e0-4c57-ad39-de8b01124c41
@extend_schema(tags=["Chat"])
class RetrieveChunksView(APIView):
    serializer_class = serializers.RetrieveRequestSerializer
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        folder_id = serializer.validated_data.get("folder_id",None)
        query = serializer.validated_data.get("query","No query provided")

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

class CreateQuizAPIView(APIView):
    serializer_class = serializers.QuizRequestSerializer
    def post(self, request):
        # Validate request
        req_serializer = self.serializer_class(data=request.data)
        if not req_serializer.is_valid():
            return Response(req_serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        topic = req_serializer.validated_data["topic"]
        try:
            # Call model
            response = model.generate(list[schemas.Quiz],system_instructions.quiz_instruction,topic)
            # Model returns JSON string
            if response : 
                parsed = json.loads(response)
                logger.success("Quiz generated ")
                # Validate response
                res_serializer = serializers.QuizResponseSerializer(data={"quizzes": parsed})
                res_serializer.is_valid(raise_exception=True)
                return Response(res_serializer.data,status=status.HTTP_200_OK)
            logger.error("Quiz generation failed")
            return Response({"error": "Quiz generation failed"},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.exception("Quiz generation failed")
            return Response({"error": str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class CreateTimelineAPIView(APIView):

    serializer_class = serializers.TimelineRequestSerializer
    def post(self, request):
        # Validate request
        req_serializer = self.serializer_class(data=request.data)
        if not req_serializer.is_valid():
            return Response(req_serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        query = req_serializer.validated_data["message"]
        try:
            # Call model
            response = model.generate(list[schemas.TimelineEntry],system_instructions.timeline_instruction,query)
            parsed = json.loads(response)
            logger.info("Timeline generated ❤️")
            # Validate response
            res_serializer = serializers.TimelineResponseSerializer(data={"response": parsed})

            res_serializer.is_valid(raise_exception=True)

            return Response(
                res_serializer.data,
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.exception("Timeline generation failed")

            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

