from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from pgvector.django import CosineDistance
from drf_spectacular.utils import extend_schema
from pydantic import ValidationError

from folders.models import Folder, Chunk
from folders.signals import embedding_model
from . import model,system_instructions,serializers,schemas
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
# chat/views.py

class CreateQuizAPIView(APIView):
    serializer_class = serializers.QuizRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        quiz_type = payload.get("type", "basic")

        if quiz_type == "basic":
            schema = list[schemas.quiz.BasicQuiz] 
            system_instruction = system_instructions.quiz_instruction
            llm_input = f"Generate a quiz on {payload.get("topic") or payload.get("query", "")} with a total number of questions : {payload.get("num_questions")}. Make sure to set the quiz with a {payload.get("difficulty")} difficulty level. Ensure that the quiz is solved within {payload.get("time_limit")} minutes"
        else:
            schema = list[schemas.quiz.Question] 
            system_instruction = system_instructions.unified_quiz_instruction
            llm_input = payload.get("query",None)

        try:
            raw_response = model.generate(schema, system_instruction, str(llm_input))
            if not raw_response:
                logger.error("Empty model response")
                return Response({"error": "Quiz generation failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            parsed = json.loads(raw_response)
            # Basic validation of response shape
            resp_serializer = serializers.QuizResponseSerializer(data={"title": f"{payload.get('topic','Assessment')} Assessment", "questions": parsed})
            resp_serializer.is_valid(raise_exception=True)
            return Response(resp_serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Quiz generation failed")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@extend_schema(tags=["Chat"])
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
            response = model.generate(list[schemas.timeline.TimelineEntry],system_instructions.timeline_instruction,query)
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

@extend_schema(tags=["Chat"])
class CreateDiagramAPIView(APIView):
    def post(self, request):
        topic = request.data.get("topic", "")
        if not topic:
            return Response({"error": "Topic is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Call model (strict schema ask)
            response_str = model.generate(
                schema=schemas.tldraw.TldrawDiagram,
                system_instruction=system_instructions.tldraw_instruction,
                query=topic,
            )
            # Parse JSON
            parsed = json.loads(response_str)
            # Validate with Pydantic
            diagram_obj = schemas.tldraw.TldrawDiagram.model_validate(parsed)
            return Response(diagram_obj.model_dump(), status=status.HTTP_200_OK)

        except ValidationError as e:
            logger.error(f"Invalid diagram JSON: {e}")
            return Response({"error": "Invalid diagram format", "details": e.errors()}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        except Exception as e:
            logger.exception("Diagram generation failed")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
