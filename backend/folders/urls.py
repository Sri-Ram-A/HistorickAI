from django.urls import path
from . import views

urlpatterns = [
    path('create/folder/', views.CreateFolderView.as_view()),
    path('create/files/', views.CreateFileView.as_view()),

    path('view/folders/', views.ViewUserFolders.as_view()),
    path('view/folder/<uuid:id>/', views.ViewUserFolder.as_view()),
]
