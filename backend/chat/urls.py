from django.urls import path, include
from django.http import HttpResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from . import views

urlpatterns = [
    path("retrieve/",views.RetrieveChunksView.as_view(),name="retrieve-chunks"),
    path("generate_quiz/", views.CreateQuizAPIView.as_view(),name="generate-quiz"),
    path("generate_timeline/", views.CreateTimelineAPIView.as_view(),name="generate-timeline"),
    path("generate_diagram/", views.CreateDiagramAPIView.as_view(),name="generate-diagram"),

]