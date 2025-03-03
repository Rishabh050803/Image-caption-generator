# api/views.py
import os
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
    temp_path = os.path.join("/tmp", file_obj.name)
    with open(temp_path, "wb") as temp_file:
        for chunk in file_obj.chunks():
            temp_file.write(chunk)
    caption = caption_with_hf_api(temp_path)
    os.remove(temp_path)  # Clean up the temporary file
    return Response({"caption": caption})

@api_view(["POST"])
@parser_classes([JSONParser])
def refine_caption(request):
    caption = request.data.get("caption", "")
    tone = request.data.get("tone", "formal")
    additional_info = request.data.get("additional_info", "")
    refined_caption = refine_caption_with_groq(caption, tone, additional_info)
    return Response({"refined_caption": refined_caption})

@api_view(["POST"])
@parser_classes([JSONParser])
def get_hashtags(request):
    caption = request.data.get("caption", "")
    hashtags = generate_hashtags(caption)
    return Response({"hashtags": hashtags})
