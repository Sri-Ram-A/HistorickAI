from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
# https://github.com/Sri-Ram-A/GovChat/blob/main/backend/citizens/views/create.py
urlpatterns = [
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path("register/",views.RegistrationAPIView.as_view(),name="user-register"),
    path("login/",views.LoginAPIView.as_view(),name="user-login")
]