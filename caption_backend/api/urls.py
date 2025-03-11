# api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Your existing views
    path('generate-caption/', views.generate_caption, name='generate_caption'),
    path('refine-caption/', views.refine_caption, name='refine_caption'),
    path('get-hashtags/', views.get_hashtags, name='get_hashtags'),
    
    # Auth views
    path('csrf-token/', views.get_csrf_token, name='csrf_token'),
    path('auth/user-profile/', views.user_profile, name='user_profile'),
    path('auth/status/', views.auth_status, name='auth_status'),
    path('debug/social-auth/', views.debug_social_auth, name='debug_social_auth'),
    # In your api/urls.py file
    path('debug/register/', views.debug_register, name='debug_register'),   
    path('auth/logout/', views.custom_logout, name='api_logout'),
    
    # Add these to your urlpatterns
    path('captions/rate/', views.submit_rating, name='submit_rating'),
    path('captions/ratings/', views.get_user_ratings, name='get_user_ratings'),
]
