import os
import sys


# python 3
sys.path.append('/usr/local/bin/python3.4')
sys.path.append('/usr/local/lib/python3.4/site-packages')
sys.path.append('/var/www/sandbox/bsrs/bsrs-django/venv/lib/python3.4/site-packages')

# project
sys.path.append('/var/www/sandbox/bsrs/python3')
sys.path.append('/var/www/sandbox/bsrs/bsrs-django/bigsky')
sys.path.append('/var/www/sandbox/bsrs/bsrs-django/bigsky/bigsky')


# 1st instantiate wsgi
from django.core.wsgi import get_wsgi_application
_application = get_wsgi_application()

# Add the app directories to the PYTHONPATH
os.environ['DJANGO_SETTINGS_MODULE'] = 'bigsky.settings.sandbox'


def application(environ, start_response):
    return _application(environ, start_response)
