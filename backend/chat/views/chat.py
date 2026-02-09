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
from chat.models import Session,Message
import chat.system_instructions as system_instructions
import chat.serializers.chat as serializers
import chat.schemas as schemas

@extend_schema(
    tags=["Chat"],
    summary="Start a Chatting Session",
    description="Starts the session",
)
class StartSessionAPIView(APIView):
    """
    Start a new chat session.
    Creates or retrieves a session folder based on today's date,
    then creates a session and stores the first message.
    """
    # permission_classes = [IsAuthenticated]
    serializer_class = serializers.StartSessionRequestSerializer

    def post(self, request):
        # Request Validation
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Key access
        validated = cast(dict,serializer.validated_data)
        source_folder_id = validated.get('source_folder_id')
        user_message = validated.get('message')
        
        try:
            # Get source folder
            source_folder = Folder.objects.get(id=source_folder_id,owner=request.user)
            # Generate session name from today's date
            session_name = datetime.now().strftime("%d:%m:%Y")
            # Check if session folder exists
            session_folder, created = Folder.objects.get_or_create(name=session_name,parent=source_folder,owner=request.user)
            if created:
                logger.info(f"Created new session folder: {session_name}")
            else:
                logger.info(f"Using existing session folder: {session_name}")
            # Create or get session
            session, session_created = Session.objects.get_or_create(session_folder=session_folder)
            # Store user message
            user_msg = Message.objects.create(session=session,role='user',content=user_message)
            # Get LLM response
            ai_response = model.generate(
                schema=None,
                system_instruction=system_instructions.chat_instruction,
                query=str(user_message)
            )
            # Store AI response
            ai_msg = Message.objects.create(
                session=session,
                role='assistant',
                content=ai_response
            )
            # Prepare response
            response_data = {
                'session_id': str(session.id),
                'session_folder_id': str(session_folder.id),
                'session_name': session_name,
                'ai_response': ai_response
            }
            resp_serializer = serializers.StartSessionResponseSerializer(data=response_data)
            resp_serializer.is_valid(raise_exception=True)
            return Response(resp_serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.exception("Failed to start session")
            return Response({"error": str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=["Chat"],
    summary="Continue the chatting session",
    description="Continue the session",
)
class ChatMessageAPIView(APIView):
    """
    Send a message in an existing chat session.
    Uses session_folder_id to retrieve the session and continue the conversation.
    """
    # permission_classes = [IsAuthenticated]
    serializer_class = serializers.ChatMessageRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated  = cast(dict,serializer.validated_data)
        
        session_folder_id = validated['session_folder_id']
        user_message = validated['message']
        
        try:
            # Get session folder
            session_folder = Folder.objects.get(id=session_folder_id,owner=request.user)
            # Get session (should exist since we're in an ongoing conversation)
            try:
                session = Session.objects.get(session_folder=session_folder,)
            except Session.DoesNotExist:
                return Response({"error": "Session not found. Please start a new session."},status=status.HTTP_404_NOT_FOUND)
            # Store user message
            user_msg = Message.objects.create(session=session,role='user',content=user_message)
            # Get LLM response
            ai_response = model.generate(
                schema=None,
                system_instruction=system_instructions.chat_instruction,
                query=str(user_message)
            )
            # Store AI response
            ai_msg = Message.objects.create(
                session=session,
                role='assistant',
                content=ai_response
            )
            # Prepare response
            response_data = {
                'ai_response': ai_response,
                'message_id': str(ai_msg.id)
            }
            resp_serializer = serializers.ChatMessageResponseSerializer(data=response_data)
            resp_serializer.is_valid(raise_exception=True)
            
            return Response(resp_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception("Failed to send message")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    