import json
from datetime import datetime
from loguru import logger
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from pgvector.django import CosineDistance
from drf_spectacular.utils import extend_schema, OpenApiResponse
from pydantic import ValidationError
from typing import cast, Dict, Any

from folders.models import Folder, Chunk
from folders.signals import embedding_model
import chat.model as model
import chat.system_instructions as system_instructions
import chat.serializers.general as serializers
import chat.schemas as schemas
from chat.models import Folder

# Create your views here.
TOP_K = 5

@extend_schema(
    tags=["Create"],
    summary="Retrieve relevant chunks from a folder using semantic search",
    description="Performs vector similarity search to find the most relevant document chunks based on the query.",
)
class RetrieveChunksView(APIView):
    serializer_class = serializers.RetrieveRequestSerializer

    def post(self, request):
        # Validate request
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = cast(Dict[str, Any], serializer.validated_data)

        # Retrieve required keys
        folder_id = validated["folder_id"]
        query = validated["query"]

        # Fetch model - Get the Chunks from the database
        folder = get_object_or_404(Folder, id=folder_id)
        query_embedding = embedding_model.encode(query, normalize_embeddings=True).tolist()
        chunks = (
            Chunk.objects
            .filter(folder=folder)
            .annotate(score=CosineDistance("embedding", query_embedding))
            .order_by("score")[:TOP_K]
        )

        # Send response
        results = serializers.ChunkResultSerializer(chunks, many=True).data
        return Response(
            {"count": len(results), "results": results},
            status=status.HTTP_200_OK
        )


@extend_schema(
    tags=["Create"],
    summary="Generate a timeline from a message",
    description="Creates a structured timeline with events and dates based on the provided message content.",
)
class CreateTimelineAPIView(APIView):
    serializer_class = serializers.TimelineRequestSerializer

    def post(self, request):
        # Validate request
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = cast(Dict[str, Any], serializer.validated_data)

        # Retrieve required keys
        query = validated["message"]

        try:
            # Fetch model - Generate timeline using LLM
            response = model.generate(
                list[schemas.timeline.TimelineEntry],
                system_instructions.timeline_instruction,
                query
            )
            parsed = json.loads(response)
            logger.info("Timeline generated ❤️")

            # Validate response
            res_serializer = serializers.TimelineResponseSerializer(data={"response": parsed})
            res_serializer.is_valid(raise_exception=True)

            # Send response
            return Response(res_serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Timeline generation failed")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema(
    tags=["Create"],
    summary="Generate a TLDraw diagram from a topic",
    description="Creates an interactive diagram representation using TLDraw format based on the specified topic.",
)
class CreateDiagramAPIView(APIView):
    serializer_class = serializers.DiagramRequestSerializer

    def post(self, request):
        # Validate request
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = cast(Dict[str, Any], serializer.validated_data)

        # Retrieve required keys
        topic = validated["topic"]

        try:
            # Fetch model - Generate diagram using LLM
            response_str = model.generate(
                schema=schemas.tldraw.TldrawDiagram,
                system_instruction=system_instructions.tldraw_instruction,
                query=topic,
            )

            # Parse and validate JSON
            parsed = json.loads(response_str)
            diagram_obj = schemas.tldraw.TldrawDiagram.model_validate(parsed)

            # Send response
            return Response(diagram_obj.model_dump(), status=status.HTTP_200_OK)

        except ValidationError as e:
            logger.error(f"Invalid diagram JSON: {e}")
            return Response(
                {"error": "Invalid diagram format", "details": e.errors()},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )
        except Exception as e:
            logger.exception("Diagram generation failed")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema(
    tags=["Create"],
    summary="Generate Mermaid diagrams from natural language",
    description="Creates various types of Mermaid diagrams (flowchart, sequence, class, etc.) from text descriptions.",
)
class GenerateDiagramAPIView(APIView):
    serializer_class = serializers.DiagramRequestSerializer

    def post(self, request):
        # Validate request
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = cast(Dict[str, Any], serializer.validated_data)

        # Retrieve required keys
        diagram_type = validated.get("type")
        query = validated.get("query")

        try:
            # Build the LLM input
            llm_input = f"""
                Diagram Type: {diagram_type}
                User Request: {query}

                Generate a {diagram_type} diagram that accurately represents this request.
                Ensure the Mermaid code is syntactically correct and will render properly.
            """

            # Fetch model - Generate diagram using LLM
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

            # Validate response
            resp_serializer = serializers.DiagramResponseSerializer(data=parsed)
            resp_serializer.is_valid(raise_exception=True)

            # Send response
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
   

@extend_schema(
    tags=["Create"],
    summary="Generate a quiz based on topic and configuration",
    description="Creates a customized quiz with specified difficulty, question count, and optional source materials.",
)
class CreateQuizAPIView(APIView):
    serializer_class = serializers.QuizRequestSerializer

    def post(self, request):
        # Validate request
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = cast(Dict[str, Any], serializer.validated_data)

        # Retrieve required keys
        quiz_type = validated.get("type", "basic")
        topic = validated.get("topic")
        query = validated.get("query")
        num_questions = validated.get("num_questions")
        difficulty = validated.get("difficulty")
        time_limit = validated.get("time_limit")
        blooms = validated.get("blooms")
        sources = validated.get("sources", {})

        # Prepare LLM input based on quiz type
        if quiz_type == "basic":
            schema = list[schemas.quiz.BasicQuiz]
            system_instruction = system_instructions.quiz_instruction
            llm_input = (
                f"Generate a quiz on {topic or query} "
                f"with a total number of questions: {num_questions}. "
                f"Make sure to set the quiz with a {difficulty} difficulty level. "
                f"Ensure that the quiz is solved within {time_limit} minutes"
            )
        else:
            schema = list[schemas.quiz.Question] 
            system_instruction = system_instructions.unified_quiz_instruction
            parts = {
                "Topic": topic,
                "Query": query,
                "Number of questions": num_questions,
                "Difficulty level": difficulty,
                "Bloom's taxonomy levels": ", ".join(blooms) if blooms else None,
                "Time limit": f"{time_limit} minutes" if time_limit else None,
            }
            llm_input = "\n".join(f"{k}: {v}" for k, v in parts.items() if v is not None)

        try:
            # Fetch model - Generate quiz using LLM
            raw_response = model.generate(schema, system_instruction, str(llm_input))
            if not raw_response:
                logger.error("Empty model response")
                return Response(
                    {"error": "Quiz generation failed"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            parsed = json.loads(raw_response)
            # Validate response
            resp_serializer = serializers.QuizResponseSerializer(
                data={
                    "title": f"{topic or 'Assessment'} Assessment",
                    "questions": parsed
                }
            )
            resp_serializer.is_valid(raise_exception=True)
            # Send response
            return Response(resp_serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Quiz generation failed")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema(
    tags=["Create"],
    summary="Evaluate user answers for a quiz",
    description="Assesses user responses against correct answers and provides detailed feedback with marks.",
)
class EvaluateAnswersAPIView(APIView):
    serializer_class = serializers.EvaluateAnswersRequestSerializer

    def post(self, request):
        # Validate request
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = cast(Dict[str, Any], serializer.validated_data)

        # Retrieve required keys
        questions = validated.get('questions', [])
        answers = validated.get('answers', {})
        config = validated.get('config', {})

        try:
            # Prepare evaluation data
            evaluation_data = {
                'questions': questions,
                'user_answers': answers,
                'config': config
            }

            system_instruction = system_instructions.evaluation_instruction
            llm_input = json.dumps(evaluation_data, indent=2)

            # Fetch model - Evaluate answers using LLM
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

            # Validate response
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

            # Send response
            return Response(resp_serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Answer evaluation failed")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


     

