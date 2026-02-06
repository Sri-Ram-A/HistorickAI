from rest_framework import serializers
from .models import Folder, File

class CreateFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ['id', 'name', 'parent']

    def validate(self, attrs):
            user = self.context['request'].user
            name = attrs['name']
            parent = attrs.get('parent')

            if Folder.objects.filter(
                name=name,
                parent=parent,
                owner=user
            ).exists():
                raise serializers.ValidationError({
                    "detail": "Folder with this name already exists in this location."
                })

            return attrs

class CreateFileSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False, allow_null=True)
    class Meta:
        model = File
        fields = ['id','name','file','folder','uploaded_at']


class ViewFolderSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    files = CreateFileSerializer(many=True, read_only=True)

    class Meta:
        model = Folder
        fields = ['id','name','parent','children','files','created_at']

    def get_children(self, obj):
        return ViewFolderSerializer(obj.children.all(), many=True).data