from django.contrib import admin
from .models import RatedCaption

@admin.register(RatedCaption)
class RatedCaptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at', 'tone')
    search_fields = ('user__email', 'generated_caption', 'custom_instruction')
    readonly_fields = ('created_at',)
    
    def get_readonly_fields(self, request, obj=None):
        # Make image display-only to prevent accidental editing of large base64 strings
        if obj:
            return self.readonly_fields + ('image',)
        return self.readonly_fields
        
    def has_add_permission(self, request):
        # Ratings should only be created through the frontend
        return False

# Register your models here.
