import os
import sys


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bigsky.settings.staging")

from django.core.wsgi import get_wsgi_application
_application = get_wsgi_application()

def application(environ, start_response):
    return _application(environ, start_response)
