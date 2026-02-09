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
        

@extend_schema(tags=["Chat"])
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
            llm_input = (
                f"Generate a quiz on {payload.get('topic') or payload.get('query', '')} "
                f"with a total number of questions: {payload.get('num_questions')}. "
                f"Make sure to set the quiz with a {payload.get('difficulty')} difficulty level. "
                f"Ensure that the quiz is solved within {payload.get('time_limit')} minutes"
            )
        else:
            # For advanced and question-bank
            schema = list[schemas.quiz.Question]
            system_instruction = system_instructions.unified_quiz_instruction
            
            # Build more detailed prompt for advanced quiz
            llm_input_parts = []
            if payload.get('topic'):
                llm_input_parts.append(f"Topic: {payload.get('topic')}")
            if payload.get('query'):
                llm_input_parts.append(f"Query: {payload.get('query')}")
            
            llm_input_parts.append(f"Number of questions: {payload.get('num_questions')}")
            
            if payload.get('difficulty'):
                llm_input_parts.append(f"Difficulty level: {payload.get('difficulty')}")
            
            if payload.get('blooms'):
                llm_input_parts.append(f"Bloom's taxonomy levels: {', '.join(list(payload.get('blooms')))}")
            
            if payload.get('time_limit'):
                llm_input_parts.append(f"Time limit: {payload.get('time_limit')} minutes")
            
            # Add source information
            sources = payload.get('sources', {})
            if sources.get('folders') or sources.get('files'):
                llm_input_parts.append(
                    f"Source folders: {sources.get('folders', [])}, "
                    f"Source files: {sources.get('files', [])}"
                )
            
            llm_input = "\n".join(llm_input_parts)

        try:
            raw_response = model.generate(schema, system_instruction, str(llm_input))
            
            if not raw_response:
                logger.error("Empty model response")
                return Response(
                    {"error": "Quiz generation failed"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            parsed = json.loads(raw_response)
            
            # Basic validation of response shape
            resp_serializer = serializers.QuizResponseSerializer(
                data={
                    "title": f"{payload.get('topic', 'Assessment')} Assessment",
                    "questions": parsed
                }
            )
            resp_serializer.is_valid(raise_exception=True)
            
            return Response(resp_serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Quiz generation failed")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema(tags=["Chat"])
class EvaluateAnswersAPIView(APIView):
    serializer_class = serializers.EvaluateAnswersRequestSerializer

    def post(self, request):
        """Evaluate user answers for advanced/question-bank quizzes"""
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        questions = payload.get('questions', [])
        answers = payload.get('answers', {})
        config = payload.get('config', {})

        try:
            # Build evaluation prompt
            evaluation_data = {
                'questions': questions,
                'user_answers': answers,
                'config': config
            }

            system_instruction = system_instructions.evaluation_instruction
            llm_input = json.dumps(evaluation_data, indent=2)

            # Call LLM for evaluation
            raw_response = model.generate(
                schema=schemas.quiz.EvaluationResult,
                system_instruction=system_instruction,
                query=llm_input
            )

            if not raw_response:
                logger.error("Empty evaluation response")
                return Response(
                    {"error": "Evaluation failed"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            evaluation_result = json.loads(raw_response)

            # Calculate statistics
            total_marks = sum(q.get('marks', 1) for q in questions)
            obtained_marks = evaluation_result.get('obtained_marks', 0)
            percentage = (obtained_marks / total_marks * 100) if total_marks > 0 else 0

            response_data = {
                'total_marks': total_marks,
                'obtained_marks': obtained_marks,
                'percentage': round(percentage, 2),
                'feedback': evaluation_result.get('feedback', [])
            }

            resp_serializer = serializers.EvaluateAnswersResponseSerializer(
                data=response_data
            )
            resp_serializer.is_valid(raise_exception=True)

            return Response(resp_serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Answer evaluation failed")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

@extend_schema(tags=["Chat"])
class GenerateDiagramAPIView(APIView):
    """
    Generate Mermaid diagrams from natural language descriptions.
    """
    serializer_class = serializers.DiagramRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        diagram_type = payload.get("type")
        query = payload.get("query")

        try:
            # Build the LLM input
            llm_input = f"""
Diagram Type: {diagram_type}
User Request: {query}

Generate a {diagram_type} diagram that accurately represents this request.
Ensure the Mermaid code is syntactically correct and will render properly.
"""

            # Call LLM with structured output
            raw_response = model.generate(
                schema=schemas.timeline.DiagramOutput,
                system_instruction=system_instructions.mermaid_instruction,
                query=llm_input
            )

            if not raw_response:
                logger.error("Empty model response for diagram generation")
                return Response(
                    {"error": "Diagram generation failed"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Parse the response
            parsed = json.loads(raw_response)

            # Validate response structure
            resp_serializer = serializers.DiagramResponseSerializer(data=parsed)
            resp_serializer.is_valid(raise_exception=True)

            return Response(resp_serializer.data, status=status.HTTP_200_OK)

        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            return Response(
                {"error": "Invalid response format from model"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.exception("Diagram generation failed")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
