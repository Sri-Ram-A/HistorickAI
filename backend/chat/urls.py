from django.urls import path, include
from django.http import HttpResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from . import views

urlpatterns = [
    path("retrieve/",views.RetrieveChunksView.as_view(),name="retrieve-chunks"),
]