import sys

from .base import *


# Turn on for debug mode in 'debug_toolbar'
# INTERNAL_IPS = ('127.0.0.1',)

LOCAL_APPS = [
    'django_extensions',
    ]

THIRD_PARTY_APPS = [
    'debug_toolbar',
    ]

INSTALLED_APPS += LOCAL_APPS + THIRD_PARTY_APPS

MIDDLEWARE_CLASSES += [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    ]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get('BSRS_DB_LOCAL_NAME', 'ci'),
        'USER': os.environ.get('BSRS_DB_LOCAL_USER', 'bsdev'),
        'PASSWORD': os.environ.get('BSRS_DB_LOCAL_NAME', 'tango'),
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Disable Caching for Local Dev
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
   }
}

if 'test' in sys.argv:
    # Will only be activated when running ``./manage.py test``
    PASSWORD_HASHERS = (
        'django.contrib.auth.hashers.MD5PasswordHasher',
    )
    from .ci import *
