from django.urls import path
from . import views

urlpatterns = [
    # folders
    path("create/folder/", views.CreateFolderView.as_view()),
    path("update/folder/<uuid:id>/", views.UpdateFolderView.as_view()),
    path("delete/folder/<uuid:id>/", views.DeleteFolderView.as_view()),
    path("view/folders/", views.ViewFoldersView.as_view()),

    # files
    path("create/file/", views.CreateFileView.as_view()),
    path("update/file/<uuid:id>/", views.UpdateFileView.as_view()),
    path("delete/file/<uuid:id>/", views.DeleteFileView.as_view()),
]
