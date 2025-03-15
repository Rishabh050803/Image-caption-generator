# caption_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from api.views import social_auth_redirect

urlpatterns = [
    # Redirect root to frontend
    path('', RedirectView.as_view(url='https://captionit-gray.vercel.app/'), name='index'),
    
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
