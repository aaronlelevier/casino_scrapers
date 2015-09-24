import os

from .base import *


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', 
        'NAME': 'persistent',
        'USER': os.environ.get('BSRS_DB_STAGING_USER', 'bsdev'),
        'PASSWORD': os.environ.get('BSRS_DB_STAGING_NAME', 'tango'),
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
