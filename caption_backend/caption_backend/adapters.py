import logging
import requests
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
        
        # Special handling for GitHub when email is not provided
        if not email and sociallogin.account.provider == 'github':
            logger.info("GitHub account without email in profile data, attempting to fetch emails")
            email = self._get_github_email(sociallogin)
            
            # If we found an email, add it to extra_data for future use
            if email:
                logger.info(f"Found GitHub email via API: {email}")
                sociallogin.account.extra_data['email'] = email
        
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
    
    def _get_github_email(self, sociallogin):
        """
        Fetch the user's email from GitHub API using the access token
        """
        try:
            # Get access token from the account
            token = sociallogin.token.token
            
            # Make request to GitHub API
            headers = {
                'Authorization': f'token {token}',
                'Accept': 'application/vnd.github.v3+json'
            }
            response = requests.get('https://api.github.com/user/emails', headers=headers)
            
            if response.status_code == 200:
                emails = response.json()
                
                # Filter for verified primary email
                for email_data in emails:
                    if email_data.get('primary') and email_data.get('verified'):
                        return email_data.get('email')
                
                # If no primary+verified email, use first verified email
                for email_data in emails:
                    if email_data.get('verified'):
                        return email_data.get('email')
                        
                # Last resort: just use the first email
                if emails and len(emails) > 0:
                    return emails[0].get('email')
            
            # Log the error if API call failed
            if response.status_code != 200:
                logger.error(f"GitHub API email fetch failed: {response.status_code} - {response.text}")
                
            return None
            
        except Exception as e:
            logger.error(f"Error fetching GitHub email: {str(e)}")
            return None
            
    def get_login_redirect_url(self, request, sociallogin=None):
        logger.info(f"Social login redirect to: {settings.LOGIN_REDIRECT_URL}")
        return settings.LOGIN_REDIRECT_URL
        
    def save_user(self, request, sociallogin, form=None):
        """
        Save user from social account with name information
        """
        # First check if we need to get the email from GitHub
        if sociallogin.account.provider == 'github' and not sociallogin.account.extra_data.get('email'):
            email = self._get_github_email(sociallogin)
            if email:
                sociallogin.account.extra_data['email'] = email
                sociallogin.email_addresses = [email]
                logger.info(f"Added GitHub email to user: {email}")
        
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