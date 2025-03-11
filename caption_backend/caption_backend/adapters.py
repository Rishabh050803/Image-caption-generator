import logging
from django.conf import settings
from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger('django.request')

class CustomAccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        logger.info(f"Regular login redirect to: {settings.LOGIN_REDIRECT_URL}")
        return settings.LOGIN_REDIRECT_URL

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """
        Auto-connect social accounts to existing users with the same email
        """
        # If social account already exists and is connected, proceed normally
        if sociallogin.is_existing:
            logger.info(f"Social account already exists, proceeding normally")
            return
            
        # Get the email from the social account
        email = sociallogin.account.extra_data.get('email')
        if not email:
            logger.warning(f"Social login without email address for provider {sociallogin.account.provider}")
            return
            
        # Convert to lowercase for case-insensitive comparison
        email = email.lower()
        logger.info(f"Checking for existing user with email: {email}")
            
        try:
            # Find user with same email address
            existing_user = User.objects.get(email__iexact=email)
            logger.info(f"Found existing user {existing_user.id} with email {email}")
            
            # Connect this social account to the existing user
            sociallogin.connect(request, existing_user)
            logger.info(f"Connected social account {sociallogin.account.provider} to existing user {existing_user.id}")
            
            # Update user's profile data if empty
            if not existing_user.first_name or not existing_user.last_name:
                data = sociallogin.account.extra_data
                
                if sociallogin.account.provider == 'google':
                    existing_user.first_name = existing_user.first_name or data.get('given_name', '')
                    existing_user.last_name = existing_user.last_name or data.get('family_name', '')
                elif sociallogin.account.provider == 'github':
                    name = data.get('name', '').split(' ', 1)
                    existing_user.first_name = existing_user.first_name or (name[0] if name else '')
                    existing_user.last_name = existing_user.last_name or (name[1] if len(name) > 1 else '')
                
                existing_user.save()
                logger.info(f"Updated user profile: {existing_user.first_name} {existing_user.last_name}")
        except User.DoesNotExist:
            logger.info(f"No existing user found with email {email}, proceeding with normal signup")
        except Exception as e:
            logger.error(f"Error during social account auto-connection: {str(e)}")

    def get_login_redirect_url(self, request, sociallogin=None):
        logger.info(f"Social login redirect to: {settings.LOGIN_REDIRECT_URL}")
        return settings.LOGIN_REDIRECT_URL
    
    def save_user(self, request, sociallogin, form=None):
        """
        Save user from social account with name information
        """
        user = super().save_user(request, sociallogin, form)
        logger.info(f"Social login user saved: {user.email}")
        
        try:
            # For Google
            if sociallogin.account.provider == 'google':
                data = sociallogin.account.extra_data
                logger.info(f"Google data: {data}")
                user.first_name = data.get('given_name', '')
                user.last_name = data.get('family_name', '')
                
            # For GitHub
            elif sociallogin.account.provider == 'github':
                data = sociallogin.account.extra_data
                logger.info(f"GitHub data: {data}")
                name = data.get('name', '').split(' ', 1)
                user.first_name = name[0] if name else ''
                user.last_name = name[1] if len(name) > 1 else ''
            
            user.save()
            logger.info(f"Updated user names: {user.first_name} {user.last_name}")
        except Exception as e:
            logger.error(f"Error setting user names: {e}")
        
        return user