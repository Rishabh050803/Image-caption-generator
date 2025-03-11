from django.shortcuts import redirect
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def social_auth_redirect(request):
    """Redirect user to frontend after social authentication"""
    frontend_url = settings.LOGIN_REDIRECT_URL or 'http://localhost:3000/auth/success'
    return redirect(frontend_url)