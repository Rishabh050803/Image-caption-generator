from django.contrib import admin
from .models import CaptionRating

@admin.register(CaptionRating)
class CaptionRatingAdmin(admin.ModelAdmin):
    list_display = ['id', 'caption_display', 'rating', 'has_image', 'feedback', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['caption_basic', 'caption_refined', 'caption_hashtags', 'feedback']
    readonly_fields = ['created_at']
    
    def caption_display(self, obj):
        if obj.caption_basic:
            return f"Basic: {obj.caption_basic[:30]}..."
        elif obj.caption_refined:
            return f"Refined: {obj.caption_refined[:30]}..."
        elif obj.caption_hashtags:
            return f"Hashtags: {obj.caption_hashtags[:30]}..."
        else:
            return "No caption"
    caption_display.short_description = "Caption"
    
    def has_image(self, obj):
        return bool(obj.image)
    has_image.boolean = True
    has_image.short_description = "Image"
