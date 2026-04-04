from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Folder, File
from .serializers import (
    FolderSerializer,
    FolderWriteSerializer,
    FileSerializer,
    FileWriteSerializer,
)


class FolderView(APIView):
    def get_serializer(self, request):
        if request.method in ["POST", "PATCH"]:
            return FolderWriteSerializer
        return FolderSerializer

    @extend_schema(tags=["Folders"], summary="Get folders or single folder")
    def get(self, request, id=None):
        if id:
            folder = get_object_or_404(
                Folder.objects.select_related("parent", "owner"),
                id=id,
                owner=request.user,
            )
            return Response(FolderSerializer(folder).data)
        folders = (
            Folder.objects.filter(owner=request.user)
            .select_related("parent", "owner")
            .order_by("created_at")
        )
        return Response(FolderSerializer(folders, many=True).data)

    @extend_schema(tags=["Folders"], summary="Create folder")
    def post(self, request):
        serializer = FolderWriteSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        folder = serializer.save()
        return Response(FolderSerializer(folder).data, status=status.HTTP_201_CREATED)

    @extend_schema(tags=["Folders"], summary="Update folder")
    def patch(self, request, id):
        folder = get_object_or_404(Folder, id=id, owner=request.user)
        serializer = FolderWriteSerializer(
            folder,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        folder = serializer.save()
        return Response(FolderSerializer(folder).data)

    @extend_schema(
        tags=["Folders"],
        summary="Delete folder",
        request=None,
        responses={204: OpenApiResponse(description="Deleted successfully")},
    )
    def delete(self, request, id):
        folder = get_object_or_404(Folder, id=id, owner=request.user)
        folder.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FileView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @extend_schema(tags=["Files"], summary="Get files or single file")
    def get(self, request, id=None):
        base_qs = File.objects.select_related("folder", "folder__owner")
        if id:
            file_obj = get_object_or_404(base_qs, id=id, folder__owner=request.user)
            return Response(FileSerializer(file_obj).data)
        folder_id = request.query_params.get("folder")
        qs = base_qs.filter(folder__owner=request.user)
        if folder_id:
            qs = qs.filter(folder_id=folder_id)
        return Response(FileSerializer(qs, many=True).data)

    @extend_schema(tags=["Files"], summary="Create file")
    def post(self, request):
        serializer = FileWriteSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        file_obj = serializer.save()
        return Response(FileSerializer(file_obj).data, status=status.HTTP_201_CREATED)

    @extend_schema(tags=["Files"], summary="Update file")
    def patch(self, request, id):
        file_obj = get_object_or_404(File, id=id, folder__owner=request.user)
        serializer = FileWriteSerializer(
            file_obj,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        file_obj = serializer.save()
        return Response(FileSerializer(file_obj).data)

    @extend_schema(
        tags=["Files"],
        summary="Delete file",
        request=None,
        responses={204: OpenApiResponse(description="Deleted successfully")},
    )
    def delete(self, request, id):
        file_obj = get_object_or_404(File, id=id, folder__owner=request.user)
        file_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
