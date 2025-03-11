from django.conf import settings

def setup():
    """Set up the default site"""
    try:
        from django.contrib.sites.models import Site
        from allauth.socialaccount.models import SocialApp
        
        # Get or create the default site
        site, created = Site.objects.get_or_create(
            id=settings.SITE_ID,
            defaults={"domain": "localhost:8000", "name": "Development"}
        )
        
        if not created and site.domain != "localhost:8000":
            site.domain = "localhost:8000"
            site.name = "Development"
            site.save()
            
        # Configure Google
        try:
            google_app, created = SocialApp.objects.get_or_create(
                provider="google",
                defaults={
                    "name": "Google",
                    "client_id": settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id'],
                    "secret": settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['secret']
                }
            )
            google_app.sites.add(site)
        except Exception as e:
            print(f"Error configuring Google app: {e}")
            
        # Configure GitHub
        try:
            github_app, created = SocialApp.objects.get_or_create(
                provider="github",
                defaults={
                    "name": "GitHub",
                    "client_id": settings.SOCIALACCOUNT_PROVIDERS['github']['APP']['client_id'],
                    "secret": settings.SOCIALACCOUNT_PROVIDERS['github']['APP']['secret']
                }
            )
            github_app.sites.add(site)
        except Exception as e:
            print(f"Error configuring GitHub app: {e}")
            
    except Exception as e:
        print(f"Site setup error: {e}")