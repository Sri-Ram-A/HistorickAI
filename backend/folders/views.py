from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
from drf_spectacular.utils import extend_schema

from .models import Folder, File
from . import serializers,models

@extend_schema(tags=["Folders"])
class CreateFolderView(APIView):
    # permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.CreateFolderSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data,context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@extend_schema(tags=["Folders"])
class CreateFileView(APIView):
    # permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = serializers.CreateFileSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
@extend_schema(tags=["Folders"])
class ViewUserFolders(APIView):
    # permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.ViewFolderSerializer

    def get(self, request):
        folders = Folder.objects.filter(
            owner=request.user,
            parent__isnull=True
        )
        serializer = self.serializer_class(folders,many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
@extend_schema(tags=["Folders"])    
class ViewUserFolder(APIView):
    # permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.ViewFolderSerializer

    def get(self, request, id):
        folder = get_object_or_404(
            Folder,
            id=id,
            owner=request.user
        )
        serializer = self.serializer_class(folder)
        return Response(serializer.data, status=status.HTTP_200_OK)
