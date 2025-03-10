# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import generate_caption, refine_caption, get_hashtags, CaptionRatingViewSet

router = DefaultRouter()
router.register(r'ratings', CaptionRatingViewSet)

urlpatterns = [
    path('generate-caption/', generate_caption, name='generate_caption'),
    path('refine-caption/', refine_caption, name='refine_caption'),
    path('get-hashtags/', get_hashtags, name='get_hashtags'),  # Changed from 'hashtags/'
    path('', include(router.urls)),
]
