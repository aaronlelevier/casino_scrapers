from .base import *

DEBUG = False

CACHES = {
    'default': {
        'BACKEND': 'redis_cache.RedisCache',
        'LOCATION': 'localhost:6379',
    },
}

# SSL_ENABLED = True
# CSRF_COOKIE_SECURE = True
# CSRF_COOKIE_HTTPONLY = True
# SESSION_COOKIE_SECURE = True
# SESSION_COOKIE_HTTPONLY = True

# REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = ('rest_framework.renderers.JSONRenderer', )
