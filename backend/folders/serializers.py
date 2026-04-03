from rest_framework import serializers
from .models import Folder, File


class FileSerializer(serializers.ModelSerializer):
    folder_name = serializers.CharField(source="folder.name", read_only=True)

    class Meta:
        model = File
        fields = [
            "id",
            "name",
            "file",
            "folder",
            "folder_name",
            "processed",
            "uploaded_at",
        ]
        read_only_fields = ["id", "processed", "uploaded_at", "folder_name"]


class FileWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ["name", "file", "folder"]

    def validate_folder(self, folder):
        user = self.context["request"].user
        if folder.owner != user:
            raise serializers.ValidationError("Invalid folder")
        return folder


class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = [
            "id",
            "name",
            "parent",
            "path",
            "is_root",
            "created_at",
            "updated_at",
        ]


class FolderWriteSerializer(serializers.ModelSerializer):
    """
    1. __init__():
        - stores request.data → self.initial_data
        - stores request → self.context
        - sets self.instance = None (for create)
    2. is_valid():
        - self.run_validation(self.initial_data): Converts uuids to foreign keys
        - validates each field in
        ```python
          fields = ["name", "parent"]
        ```
        - validate_parent(self,parent) :
            2.1. parent already converted to Folder instance
            2.2. method is called
            2.3. you check ownership
        - validate(self, attrs):
    3. save()
        └── create() or update()
    4. return instance
    """

    class Meta:
        model = Folder
        fields = ["name", "parent"]

    def validate_parent(self, parent):
        user = self.context["request"].user
        if parent and parent.owner != user:
            raise serializers.ValidationError("Invalid parent folder")
        return parent

    def validate(self, attrs):
        user = self.context["request"].user
        name = attrs.get("name", getattr(self.instance, "name", None))
        parent = attrs.get("parent", getattr(self.instance, "parent", None))
        qs = Folder.objects.filter(name=name, parent=parent, owner=user)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError("Folder already exists here")
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        parent = validated_data.get("parent")
        return Folder.objects.create(
            owner=user, is_root=parent is None, **validated_data
        )

    def update(self, instance, validated_data):
        parent = validated_data.get("parent", instance.parent)
        instance.name = validated_data.get("name", instance.name)
        instance.parent = parent
        instance.is_root = parent is None
        instance.save()
        return instance
