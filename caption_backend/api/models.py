from django.db import models
from django.conf import settings

class RatedCaption(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rated_captions')
    image = models.TextField()  # Base64 encoded image
    generated_caption = models.TextField()
    rating = models.IntegerField()  # Rating out of 5 or 10
    tone = models.CharField(max_length=50, null=True, blank=True)
    custom_instruction = models.TextField(null=True, blank=True)
    hashtags = models.TextField(null=True, blank=True)  # Store as comma-separated or JSON string
    refined_caption = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Caption by {self.user.email} (Rating: {self.rating})"
