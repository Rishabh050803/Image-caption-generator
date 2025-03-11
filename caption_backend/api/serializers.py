from rest_framework import serializers
from .models import RatedCaption

class RatedCaptionSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    
    class Meta:
        model = RatedCaption
        fields = [
            'id', 'user', 'user_email', 'image', 'generated_caption', 'rating', 
            'tone', 'custom_instruction', 'hashtags', 'refined_caption', 'created_at'
        ]
        read_only_fields = ['user', 'user_email', 'created_at']
    
    def get_user_email(self, obj):
        return obj.user.email
        
    def create(self, validated_data):
        # Assign the current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)