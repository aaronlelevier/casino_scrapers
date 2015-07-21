import os

from .base import *


LOGGING = None

TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'

NOSE_ARGS = [
    '--with-coverage',
    '--cover-package=contact,location,order,person,role,session,util',
]

DEBUG = True

# TODO
# Database connection strings needed to be added.
# python example environmental variable syntax below.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', 
        'NAME': 'staging',          # os.environ['DB_NAME']
        'USER': 'postgres',         # os.environ['DB_USER']
        'PASSWORD': 'postgres',     # os.environ['DB_PASSWORD']
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

PASSWORD_HASHERS = ('django.contrib.auth.hashers.MD5PasswordHasher', )

DEFAULT_FILE_STORAGE = 'inmemorystorage.InMemoryStorage'
