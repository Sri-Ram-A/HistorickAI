import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models import Q, UniqueConstraint
from pgvector.django import VectorExtension
from django.db import migrations
from pgvector.django import VectorField
from django.db.models import JSONField

# Create your models here.

class Folder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='children',
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=['name', 'parent', 'owner'],
                name='unique_folder_with_parent'
            ),
            UniqueConstraint(
                fields=['name', 'owner'],
                condition=Q(parent__isnull=True),
                name='unique_root_folder'
            )
        ]

    def __str__(self):
        return f"[{self.name}]"

class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='files/')
    name = models.CharField(max_length=255)
    folder = models.ForeignKey(
        Folder,
        related_name='files',
        on_delete=models.CASCADE
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.folder}/{self.name}"

class Migration(migrations.Migration):
    operations = [VectorExtension()]

class Chunk(models.Model):
    id = models.BigAutoField(primary_key=True)
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name="chunks")
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE)  # denormalized for speed
    text = models.TextField()
    embedding = VectorField(dimensions=384)  # depends on your model
    metadata = JSONField(null=True, blank=True)  # store page numbers, bounding boxes, etc.
    def __str__(self):
        return f"{self.folder}/{self.file}/chunk-{self.id}"
