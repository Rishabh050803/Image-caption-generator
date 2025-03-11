import os
import tempfile
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
# import redirect from 

from django.shortcuts import redirect
from django.middleware.csrf import get_token
from django.http import JsonResponse
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

@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Return the current user's profile information"""
    user = request.user
    return Response({
        'id': user.id,
        'email': user.email,
        'username': getattr(user, 'username', user.email),
        'isAuthenticated': True
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def auth_status(request):
    """Check if user is authenticated"""
    if request.user.is_authenticated:
        return Response({
            'isAuthenticated': True,
            'user': {
                'id': request.user.id,
                'email': request.user.email,
                'username': getattr(request.user, 'username', request.user.email),
            }
        })
    return Response({'isAuthenticated': False})

@api_view(['GET'])
@permission_classes([AllowAny])
def debug_social_auth(request):
    """Debug view to check social auth configuration"""
    from allauth.socialaccount.models import SocialApp
    from django.contrib.sites.models import Site
    
    try:
        sites = list(Site.objects.all().values())
        social_apps = list(SocialApp.objects.all().values('id', 'provider', 'name', 'client_id'))
        
        # Get site associations for each app
        app_sites = {}
        for app in SocialApp.objects.all():
            app_sites[app.id] = list(app.sites.all().values_list('domain', flat=True))
        
        return Response({
            'sites': sites,
            'social_apps': social_apps,
            'app_sites': app_sites,
            'current_site_id': settings.SITE_ID
        })
    except Exception as e:
        return Response({'error': str(e)})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """Return the CSRF token for cross-domain requests."""
    return JsonResponse({'csrfToken': get_token(request)})

@api_view(['GET'])
@permission_classes([AllowAny])
def social_auth_redirect(request):
    """Redirect user to frontend after social authentication"""
    frontend_url = getattr(settings, 'LOGIN_REDIRECT_URL', 'http://localhost:3000/auth/success')
    return redirect(frontend_url)

@api_view(['POST'])
@permission_classes([AllowAny])
def debug_register(request):
    """Debug endpoint to log registration data and errors"""
    import logging
    from dj_rest_auth.registration.serializers import RegisterSerializer
    from caption_backend.serializers import CustomRegisterSerializer
    
    logger = logging.getLogger('django.request')
    
    try:
        data = request.data.copy()
        debug_data = data.copy()
        
        # Redact sensitive fields for logging
        if 'password1' in debug_data:
            debug_data['password1'] = '***'
        if 'password2' in debug_data:
            debug_data['password2'] = '***'
            
        logger.info(f"Registration data received: {debug_data}")
        
        # Try to validate with the custom serializer
        serializer = CustomRegisterSerializer(data=data)
        if not serializer.is_valid():
            logger.error(f"Registration validation errors: {serializer.errors}")
            return Response({"errors": serializer.errors}, status=400)
            
        return Response({"message": "Data would be valid"})
    except Exception as e:
        logger.error(f"Error in debug_register: {e}")
        return Response({"error": str(e)})

@api_view(['POST', 'GET'])  # Allow both POST and GET for easier debugging
@permission_classes([AllowAny])  # Allow anyone to logout
def custom_logout(request):
    """Custom logout view that handles CSRF and cookie clearing"""
    from django.contrib.auth import logout
    from rest_framework.response import Response
    from django.conf import settings
    import logging
    
    logger = logging.getLogger('django.request')
    logger.info("Logout attempt received")
    
    # Perform server-side logout
    logout(request)
    
    # Create response
    response = Response({"detail": "Logout successful"})
    
    # Clear auth cookies
    response.delete_cookie(settings.JWT_AUTH_COOKIE)
    response.delete_cookie(settings.JWT_AUTH_REFRESH_COOKIE)
    response.delete_cookie('csrftoken')
    response.delete_cookie('sessionid')
    
    logger.info("User logged out, cookies cleared")
    return response
