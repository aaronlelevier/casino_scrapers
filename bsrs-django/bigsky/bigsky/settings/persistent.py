from .base import *


LOCAL_APPS = (
    'django_extensions',
    )

DATA_TRANSFORM_APPS = (
    'utils_transform.tlocation',
    )

INSTALLED_APPS += LOCAL_APPS + DATA_TRANSFORM_APPS


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'persistent',
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

DATABASE_ROUTERS = ['bigsky.db_router.TransformRouter', 'bigsky.db_router.DefaultRouter']
