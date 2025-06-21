from django.apps import AppConfig


class LibraryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.library'
    verbose_name = 'Library Management'
    
    def ready(self):
        import apps.library.signals