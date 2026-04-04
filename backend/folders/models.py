import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models import Q, UniqueConstraint
import shortuuid
# Create your models here.

class Folder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey(
        "self", null=True, blank=True, related_name="children", on_delete=models.CASCADE,
        db_index=True, # CRITICAL for Hierarchical Data - BTree optimization
    )
    path = models.TextField(
        blank=True
    )  # optional: cache full path (for faster queries) e.g. "root/ai/papers"
    is_root = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=["name", "parent", "owner"], name="unique_folder_with_parent"
            ),
            UniqueConstraint(
                fields=["name", "owner"],
                condition=Q(parent__isnull=True),
                name="unique_root_folder",
            ),
        ]

    def __str__(self):
        return f"{self.name}"


class File(models.Model):
    """
    Signals attached to this model
    post_save  → handle_file_upload  (folders/signals.py)
    pre_delete → handle_file_delete  (folders/signals.py)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to="files/", null=True, blank=True)
    name = models.CharField(max_length=255)
    folder = models.ForeignKey(Folder, related_name="files", on_delete=models.CASCADE)
    processed = models.BooleanField(default=False)  # for RAG pipeline
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}"


class Notebook(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=22,
        default=shortuuid.uuid,
        editable=False
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    use_subfolders = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title}"
