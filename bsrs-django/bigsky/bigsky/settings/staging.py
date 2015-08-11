import os

from .base import *


LOGGING = None

TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'

NOSE_ARGS = [
    '--with-coverage',
    '--cover-package=contact,location,order,person,role,session,util',
]

DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', 
        'NAME': os.environ.get('BSRS_DB_STAGING_NAME', 'ci'),
        'USER': os.environ.get('BSRS_DB_STAGING_USER', 'bsdev'),
        'PASSWORD': os.environ.get('BSRS_DB_STAGING_NAME', 'tango'),
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

PASSWORD_HASHERS = ('django.contrib.auth.hashers.MD5PasswordHasher', )

DEFAULT_FILE_STORAGE = 'inmemorystorage.InMemoryStorage'
