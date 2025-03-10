import os
import tempfile
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.response import Response
from .services import caption_with_hf_api, refine_caption_with_groq, generate_hashtags

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
    return Response({"hashtags": hashtags})

