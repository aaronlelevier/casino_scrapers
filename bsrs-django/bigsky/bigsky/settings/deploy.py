from .prod import *

# Turn on for debug mode in 'debug_toolbar'
INTERNAL_IPS = ('127.0.0.1', '10.18.6.34')

DATABASES['default'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': 'deploy',
    'USER': 'bsdev',
    'PASSWORD': 'tango',
    'HOST': 'localhost',
    'PORT': '5432',
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
MEDIA_ROOT = "/var/www/media/deploy/"
STATIC_ROOT = "/var/www/static/deploy/"
