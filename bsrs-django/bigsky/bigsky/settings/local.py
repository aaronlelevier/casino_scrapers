from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

# Change for now b/c PostgreSQL uses different PW hashes if generating
# sqlite test fixtures.
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql_psycopg2', 
#         'NAME': 'aaron',
#         'USER': '',
#         'PASSWORD': '',
#         'HOST': 'localhost',
#         'PORT': '5432',
#     }
# }

INSTALLED_APPS += (
    'django_extensions',
    )

if 'test' in sys.argv:
    from .ci import *