import os

from django.core.wsgi import get_wsgi_application

# bigsky.settings.base?
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bigsky.settings")

application = get_wsgi_application()
