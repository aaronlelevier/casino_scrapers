import os
import sys


# python 3
sys.path.append('/usr/local/bin/python3')
sys.path.append('/usr/local/lib/python3.3/site-packages')

# project
sys.path.append('/www/django/releases/persistent/bsrs')
sys.path.append('/www/django/releases/persistent/bsrs/bsrs-django')
sys.path.append('/www/django/releases/persistent/bsrs/bsrs-django/bigsky')


# 1st instantiate wsgi
from django.core.wsgi import get_wsgi_application
_application = get_wsgi_application()

# Add the app directories to the PYTHONPATH
os.environ['DJANGO_SETTINGS_MODULE'] = 'bigsky.settings.prod'


def application(environ, start_response):
    return _application(environ, start_response)