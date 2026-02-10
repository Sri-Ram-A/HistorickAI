from chat.models import Session
from folders.models import Folder
from django.shortcuts import get_object_or_404
from django import http
from rest_framework.request import Request

class SessionResolverMixin:

    def get_session(self, request: Request) -> Session:
        folder_id = request.data.get("source_folder_id",None)  # type: ignore
        folder = get_object_or_404(
            Folder,
            id=folder_id,
            owner=request.user
        )
        session, _ = Session.objects.get_or_create(
            session_folder=folder
        )
        return session
