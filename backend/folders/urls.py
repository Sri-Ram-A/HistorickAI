from django.urls import path
from .views import FolderView, FileView

urlpatterns = [
    # Folder endpoints
    path("folders/", FolderView.as_view()),                # GET (list), POST
    path("folders/<uuid:id>/", FolderView.as_view()),      # GET (single), PATCH, DELETE

    # File endpoints
    path("files/", FileView.as_view()),                    # GET (list), POST
    path("files/<uuid:id>/", FileView.as_view()),          # GET (single), PATCH, DELETE
]