from django.apps import AppConfig

class CaptionBackendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'caption_backend'
    
    def ready(self):
        try:
            # Import here to avoid circular imports
            import threading
            if threading.current_thread().name == 'main_thread':
                from . import site_setup
                site_setup.setup()
        except Exception as e:
            print(f"Error in app ready(): {e}")