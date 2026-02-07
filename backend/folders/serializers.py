from rest_framework import serializers
from .models import Folder, File

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ["id", "name", "file", "folder", "uploaded_at"]


class FileCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ["name", "file", "folder"]

class FolderSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    files = FileSerializer(many=True, read_only=True)
    class Meta:
        model = Folder
        fields = ["id", "name", "parent", "created_at","files","children"]
    def get_children(self, obj):
        return FolderSerializer(obj.children.all(), many=True).data
class FolderCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ["name", "parent"]

    def validate(self, attrs):
        user = self.context["request"].user
        name = attrs.get("name")
        parent = attrs.get("parent")
        query_set = Folder.objects.filter(name=name, parent=parent, owner=user)
        if self.instance:
            query_set = query_set.exclude(id=self.instance.id)
        if query_set.exists():
            raise serializers.ValidationError("Folder with this name already exists here.")
        return attrs
