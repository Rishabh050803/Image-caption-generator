from django.shortcuts import redirect
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from dotenv import load_dotenv
import os
from api.views import social_auth_redirect

# Load environment variables from .env (only for local development)
load_dotenv()

# Get frontend URL: Use .env in dev, use environment variable in production
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")  # Default to local dev


@api_view(['GET'])
@permission_classes([AllowAny])
def social_auth_redirect(request):
    """Redirect user to frontend after social authentication"""
    frontend_url = settings.LOGIN_REDIRECT_URL or f'{FRONTEND_URL}/auth/success'
    return redirect(frontend_url)