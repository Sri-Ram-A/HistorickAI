from rest_framework import serializers
from folders.models import Folder
from chat.models import Session, Message

class MessageSerializer(serializers.ModelSerializer):
    """Serializer for individual messages"""
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']

class SessionSerializer(serializers.ModelSerializer):
    """Serializer for chat sessions"""
    messages = MessageSerializer(many=True, read_only=True)
    session_folder_id = serializers.UUIDField(source='session_folder.id', read_only=True)
    session_name = serializers.CharField(source='session_folder.name', read_only=True)

    class Meta:
        model = Session
        fields = ['id', 'session_folder_id', 'session_name', 'messages', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class StartSessionRequestSerializer(serializers.Serializer):
    """Request serializer for starting a new chat session"""
    source_folder_id = serializers.UUIDField(required=True,help_text="ID of the source folder (parent folder for session folders)")
    message = serializers.CharField(required=True,max_length=5000,help_text="First message to start the conversation")

class StartSessionResponseSerializer(serializers.Serializer):
    """Response serializer for session start"""
    session_id = serializers.UUIDField()
    session_folder_id = serializers.UUIDField()
    session_name = serializers.CharField()
    ai_response = serializers.CharField()


class ChatMessageRequestSerializer(serializers.Serializer):
    """Request serializer for sending messages in existing session"""
    session_folder_id = serializers.UUIDField(required=True,help_text="ID of the session folder")
    message = serializers.CharField(required=True,max_length=5000,help_text="User message content")

class ChatMessageResponseSerializer(serializers.Serializer):
    """Response serializer for chat messages"""
    ai_response = serializers.CharField()
    message_id = serializers.UUIDField()