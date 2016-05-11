from .prod import *

# Turn on for debug mode in 'debug_toolbar'
INTERNAL_IPS = ('127.0.0.1',)

DATABASES['default'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': 'deploy',
    'USER': 'bsdev',
    'PASSWORD': 'tango',
    'HOST': 'localhost',
    'PORT': '5432',
}

CACHES = {
    'default': {
        'BACKEND': 'redis_cache.RedisCache',
        'LOCATION': 'localhost:6379',
    },
}

MEDIA_ROOT = "/var/www/media/deploy/"
STATIC_ROOT = "/var/www/static/deploy/"
