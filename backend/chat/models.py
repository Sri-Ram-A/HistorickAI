# chat/models.py
import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models import Q, UniqueConstraint
from folders.models import File,Folder

class Session(models.Model):
    """Chat session model that stores conversation history.Each session is linked to a folder where the conversation is stored."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_folder = models.ForeignKey(Folder,on_delete=models.CASCADE,related_name='sessions',help_text="Folder where this session's messages are stored")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Session {self.id} - {self.session_folder.name}"

class Flowchart(models.Model):
    DIAGRAM_TYPES = [
        ("flowchart", "Flowchart"),
        ("sequence", "Sequence"),
        ("gantt", "Gantt"),
        ("class", "Class"),
        ("git", "Git"),
        ("er", "ER"),
        ("journey", "Journey"),
        ("quadrant", "Quadrant"),
        ("xy", "XY"),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(Session,on_delete=models.CASCADE,related_name="flowcharts")
    query = models.TextField()
    response = models.TextField()
    type = models.CharField(choices=DIAGRAM_TYPES, help_text="Type of flowchart to generate")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        indexes = [models.Index(fields=["session"]),models.Index(fields=["created_at"]),]

class Message(models.Model):
    """ Individual message in a chat session. Stores both user and AI messages. """
    ROLE_CHOICES = [('user', 'User'),('assistant', 'Assistant')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(Session,on_delete=models.CASCADE,related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."