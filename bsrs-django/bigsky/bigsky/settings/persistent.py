from .prod import *


PERSISTENT_LOCAL_APPS = [
    'utils_transform.tlocation',
    'utils_transform.tcategory',
    'utils_transform.trole',
    'utils_transform.tperson',    
    ]

INSTALLED_APPS = DEFAULT_APPS + THIRD_PARTY_APPS + LOCAL_APPS + PERSISTENT_LOCAL_APPS


DATABASES['default'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': 'persistent',
    'USER': 'bsdev',
    'PASSWORD': 'tango',
    'HOST': 'localhost',
    'PORT': '5432',
}

DATABASES['transforms'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': 'transforms',
    'USER': 'bsdev',
    'PASSWORD': 'tango',
    'HOST': 'localhost',
    'PORT': '5432',
}

DATABASE_ROUTERS = ['bigsky.db_router.TransformRouter', 'bigsky.db_router.DefaultRouter']


MEDIA_ROOT = "/var/www/media/persistent/"
STATIC_ROOT = "/var/www/static/persistent/"
