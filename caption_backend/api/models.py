from django.db import models
import os
import time

def image_upload_path(instance, filename):
    """Generate a unique filepath for each uploaded image"""
    # Create a unique filename with timestamp
    base, ext = os.path.splitext(filename)
    new_filename = f"{base}_{instance.rating}_{int(time.time())}{ext}"
    return os.path.join('caption_images', new_filename)

class CaptionRating(models.Model):
    # Use custom upload path function
    image = models.ImageField(upload_to=image_upload_path, blank=True, null=True)
    
    # Other fields remain the same
    caption = models.TextField(default="")
    caption_basic = models.TextField(blank=True, null=True)
    caption_refined = models.TextField(blank=True, null=True)
    caption_hashtags = models.TextField(blank=True, null=True)
    rating = models.IntegerField(choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5')])
    feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Rating: {self.rating} for caption: {self.caption[:30]}..."
        
    def save(self, *args, **kwargs):
        """Override save method to add extra debug logging"""
        print(f"Saving CaptionRating with image: {bool(self.image)}")
        if self.image:
            print(f"Image details: {self.image.name}, size: {getattr(self.image, 'size', 'Unknown')}")
        super().save(*args, **kwargs)
        print(f"CaptionRating saved with ID: {self.id}, image path: {self.image.name if self.image else 'None'}")
