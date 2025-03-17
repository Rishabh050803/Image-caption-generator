from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
import os
from api.views import social_auth_redirect

from dotenv import load_dotenv
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Get frontend URL: Use .env in dev, use environment variable in production
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")  # Default to local dev

urlpatterns = [
    # Redirect root to frontend (dynamic URL based on environment)
    path('', RedirectView.as_view(url=FRONTEND_URL), name='index'),
    
    # Admin and API
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    
    # Authentication endpoints
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    
    # Social authentication
    path('accounts/', include('allauth.urls')),
    path('accounts/profile/', social_auth_redirect, name='profile_redirect'),
]
