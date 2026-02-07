from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import Folder, File
from .serializers import (
    FolderSerializer,
    FolderCreateUpdateSerializer,
    FileSerializer,
    FileCreateUpdateSerializer,
)
@extend_schema(tags=["Folders"],summary="Create a folder for logged in user")
class CreateFolderView(APIView):
    serializer_class = FolderCreateUpdateSerializer
    def post(self, request):
        serializer = self.serializer_class(data=request.data,context={"request": request})
        serializer.is_valid(raise_exception=True)
        folder = serializer.save(owner=request.user)
        return Response(FolderSerializer(folder).data,status=status.HTTP_201_CREATED)
    
@extend_schema(tags=["Folders"],summary="Update Folder name for logged in user")
class UpdateFolderView(APIView):
    serializer_class = FolderCreateUpdateSerializer

    def patch(self, request, id):
        folder = get_object_or_404(Folder, id=id, owner=request.user)
        serializer = self.serializer_class(
            folder,
            data=request.data,
            partial=True,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(FolderSerializer(folder).data)
    
@extend_schema(
    tags=["Folders"],
    summary="Delete Folder of logged in user",
    request=None,
    responses={204: OpenApiResponse(description="Deleted successfully")}
)
class DeleteFolderView(APIView):
    def delete(self, request, id):
        folder = get_object_or_404(Folder, id=id, owner=request.user)
        folder.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@extend_schema(tags=["Folders"],summary="View all folders of logged in user")
class ViewFoldersView(APIView):
    serializer_class=FolderSerializer

    def get(self, request):
        folders = Folder.objects.filter(owner=request.user, parent__isnull=True)
        serializer = self.serializer_class(folders, many=True)
        return Response(serializer.data)

@extend_schema(tags=["Files"],summary="Create File of Logged in user")
class CreateFileView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = FileCreateUpdateSerializer
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        file = serializer.save()
        return Response(FileSerializer(file).data,status=status.HTTP_201_CREATED)
@extend_schema(tags=["Files"],summary="Update file name of logged in user")
class UpdateFileView(APIView):
    serializer_class = FileCreateUpdateSerializer
    def patch(self, request, id):
        file = get_object_or_404(File, id=id)

        serializer = self.serializer_class(
            file,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(FileSerializer(file).data)
@extend_schema(
    tags=["Files"],
    summary="Delete file of logged in user",
    request=None,
    responses={204: OpenApiResponse(description="Deleted successfully")}
)
class DeleteFileView(APIView):
    def delete(self, request, id):
        file = get_object_or_404(File, id=id,folder__owner=request.user)
        file.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)