from .base import *


LOGGING = None

TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'

NOSE_ARGS = [
    '--cover-package=contact,location,order,person,role,session,util',
]

DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', 
        'NAME': 'ci',
        'USER': 'bsdev',
        'PASSWORD': 'tango',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

PASSWORD_HASHERS = ('django.contrib.auth.hashers.MD5PasswordHasher', )
DEFAULT_FILE_STORAGE = 'inmemorystorage.InMemoryStorage'
