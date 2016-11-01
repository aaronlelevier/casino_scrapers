import platform

from .prod import *

# Turn on for debug mode in 'debug_toolbar'
INTERNAL_IPS = ('127.0.0.1',)

PERSISTENT_APPS = [
    'utils_transform.tcategory',
    'utils_transform.tlocation',
    'utils_transform.tperson',    
    'utils_transform.trole',
    'utils_transform.tticket',
    ]


INSTALLED_APPS = INSTALLED_APPS + PERSISTENT_APPS


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


### LOGGING ###
if platform.system() == 'Linux':
    LOGGING_DIR = '/var/log/persistent/'
