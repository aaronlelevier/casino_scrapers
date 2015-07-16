import os
import sys


# project
sys.path.append('/www/django/releases/20150715/bsrs-django/bigsky')

# how do we change the django settings on the fly?
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bigsky.settings.ci")

from django.core.wsgi import get_wsgi_application
_application = get_wsgi_application()

def application(environ, start_response):
    return _application(environ, start_response)
