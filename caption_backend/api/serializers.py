from rest_framework import serializers
from .models import CaptionRating

class CaptionRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaptionRating
        fields = ['id', 'image', 'caption', 'caption_basic', 'caption_refined', 'caption_hashtags', 'rating', 'feedback', 'created_at']
