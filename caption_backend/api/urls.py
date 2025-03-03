# api/urls.py
from django.urls import path
from .views import generate_caption, refine_caption, get_hashtags

urlpatterns = [
    path("generate-caption/", generate_caption, name="generate_caption"),
    path("refine-caption/", refine_caption, name="refine_caption"),
    path("get-hashtags/", get_hashtags, name="get_hashtags"),
]
