import sys

from .base import *


# Turn on for debug mode in 'debug_toolbar'
# INTERNAL_IPS = ('127.0.0.1',)

LOCAL_APPS = (
    'django_extensions',
    )

THIRD_PARTY_APPS = (
    'debug_toolbar',
    )

# Data tranformation apps (from Domino -> to -> PostgreSQL)
# Docs: https://docs.djangoproject.com/en/1.8/topics/db/multi-db/

DATA_TRANSFORM_APPS = (
    'utils_transform.tlocation',
    )

INSTALLED_APPS += LOCAL_APPS + THIRD_PARTY_APPS + DATA_TRANSFORM_APPS

MIDDLEWARE_CLASSES += (
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    )

DATABASE_ROUTERS = ['bigsky.db_router.TransformRouter', 'bigsky.db_router.DefaultRouter']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'ci',
        'USER': 'bsdev',
        'PASSWORD': 'tango',
        'HOST': 'localhost',
        'PORT': '5432',
    },
    'transforms': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'transforms',
        'USER': 'bsdev',
        'PASSWORD': 'tango',
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
