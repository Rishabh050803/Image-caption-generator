import os
import tempfile
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, JSONParser, FormParser
from rest_framework.response import Response
from .services import caption_with_hf_api, refine_caption_with_groq, generate_hashtags
from rest_framework import viewsets, status
from .models import CaptionRating
from .serializers import CaptionRatingSerializer

@api_view(["POST"])
@parser_classes([MultiPartParser])
def generate_caption(request):
    # Expecting a file upload
    if "file" not in request.FILES:
        return Response({"error": "No file provided."}, status=400)

    file_obj = request.FILES["file"]
    temp_dir = tempfile.gettempdir()  # Get the appropriate temp directory for the current OS
    temp_path = os.path.join(temp_dir, file_obj.name)
    
    try:
        # Write the uploaded file to the temporary file
        with open(temp_path, "wb") as temp_file:
            for chunk in file_obj.chunks():
                temp_file.write(chunk)
        # Process the file using your service function
        caption = caption_with_hf_api(temp_path)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    finally:
        # Always clean up the temporary file if it exists
        if os.path.exists(temp_path):
            os.remove(temp_path)
    
    return Response({"caption": caption})

@api_view(["POST"])
@parser_classes([JSONParser])
def refine_caption(request):
    # Get the caption from the request
    caption = request.data.get("caption", "")
    print(f"REFINE ENDPOINT RECEIVED CAPTION: '{caption}'")
    
    # Basic validation
    if not caption or len(caption.strip()) < 3 or caption.lower() == "error":
        print("REFINE ENDPOINT RECEIVED INVALID CAPTION")
        return Response({"refined_caption": "No valid caption provided for refinement"})
        
    tone = request.data.get("tone", "formal")
    additional_info = request.data.get("additional_info", "")
    
    print(f"REFINE ENDPOINT CALLING SERVICE WITH CAPTION: '{caption}'")
    refined_caption = refine_caption_with_groq(caption, tone, additional_info)
    print(f"REFINE ENDPOINT RETURNING: '{refined_caption}'")
    
    return Response({"refined_caption": refined_caption})

@api_view(["POST"])
@parser_classes([JSONParser])
def get_hashtags(request):
    caption = request.data.get("caption", "")
    hashtags = generate_hashtags(caption)
    
    # Ensure we return unique hashtags
    unique_hashtags = []
    for tag in hashtags:
        if tag not in unique_hashtags:
            unique_hashtags.append(tag)
    
    return Response({"hashtags": unique_hashtags})

class CaptionRatingViewSet(viewsets.ModelViewSet):
    queryset = CaptionRating.objects.all()
    serializer_class = CaptionRatingSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def create(self, request, *args, **kwargs):
        print("\n--------- RATING SUBMISSION ---------")
        print(f"Content-Type: {request.headers.get('Content-Type', 'None')}")
        print(f"FILES: {list(request.FILES.keys())}")
        print(f"POST data keys: {list(request.data.keys())}")
        
        # Check image file details
        if 'image' in request.FILES:
            image_file = request.FILES['image']
            print(f"Image received: {image_file.name} ({image_file.size} bytes, {image_file.content_type})")
            
            # Simple validation
            if image_file.size == 0:
                print("WARNING: Image file has zero size!")
        else:
            print("No image found in request.FILES")
        
        # Create a copy of the request data for modification
        data = request.data.copy()
        
        # Ensure caption field is set
        if 'caption' not in data or not data['caption']:
            data['caption'] = (
                data.get('caption_basic', '') or 
                data.get('caption_refined', '') or 
                data.get('caption_hashtags', '') or
                'No caption'
            )
            print(f"Set caption field to: {data['caption'][:50]}...")
        
        # Create and validate serializer
        serializer = self.get_serializer(data=data)
        
        if not serializer.is_valid():
            print("VALIDATION ERRORS:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Save the model
        try:
            self.perform_create(serializer)
            print(f"Rating saved successfully with ID: {serializer.data.get('id')}")
            
            # Check if image path was saved
            if serializer.data.get('image'):
                print(f"Image saved at: {serializer.data.get('image')}")
            else:
                print("No image path in saved data")
                
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            print(f"ERROR saving rating: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_queryset(self):
        queryset = CaptionRating.objects.all()
        caption = self.request.query_params.get('caption')
        if caption is not None:
            queryset = queryset.filter(caption__contains=caption)
        return queryset

