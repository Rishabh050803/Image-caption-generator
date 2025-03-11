import logging
from django.conf import settings
from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

logger = logging.getLogger('django.request')

class CustomAccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        logger.info(f"Regular login redirect to: {settings.LOGIN_REDIRECT_URL}")
        return settings.LOGIN_REDIRECT_URL

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
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