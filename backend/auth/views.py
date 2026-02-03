from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt.views import TokenRefreshView

from . import serializer

@extend_schema(tags=["Auth"])
class RegistrationAPIView(APIView):
    permission_classes = [AllowAny]
    serializer_class = serializer.UserRegisterSerializer
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"details": "Registration successful"}, status=status.HTTP_201_CREATED)
        return Response({"details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
@extend_schema(tags=["Auth"])
class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    serializer_class = serializer.UserLoginSerializer 
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data.get("user") # type: ignore
        refresh = RefreshToken.for_user(user) # type: ignore
        return Response({"access": str(refresh.access_token),"refresh": str(refresh),}, status=status.HTTP_200_OK)
    
@extend_schema(tags=["Auth"])
class CustomTokenRefreshView(TokenRefreshView):
    pass