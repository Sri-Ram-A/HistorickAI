from django.urls import path
from . import views

# https://github.com/Sri-Ram-A/GovChat/blob/main/backend/citizens/views/create.py
urlpatterns = [
    path(
        "token/refresh/", views.CustomTokenRefreshView.as_view(), name="token-refresh"
    ),
    path("register/", views.RegistrationAPIView.as_view(), name="user-register"),
    path("login/", views.LoginAPIView.as_view(), name="user-login"),
]
