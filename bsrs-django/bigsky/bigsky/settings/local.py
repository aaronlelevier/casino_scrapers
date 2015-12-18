import sys

from .base import *


# Turn on for debug mode in 'debug_toolbar'
INTERNAL_IPS = ('127.0.0.1',)

LOCAL_APPS = [
    'django_extensions',
    ]

THIRD_PARTY_APPS = [
    'debug_toolbar',
    ]

# Data tranformation apps (from Domino -> to -> PostgreSQL)
# Docs: https://docs.djangoproject.com/en/1.8/topics/db/multi-db/

INSTALLED_APPS += LOCAL_APPS + THIRD_PARTY_APPS

MIDDLEWARE_CLASSES += [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    ]

# Disable Caching for Local Dev
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
   }
}

if 'test' in sys.argv:
    from .ci import *
