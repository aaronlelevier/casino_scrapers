from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

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

if 'test' in sys.argv:
	TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'

	NOSE_ARGS = [
	    '--cover-package=contact,location,order,person,role,session,util',
	]

	PASSWORD_HASHERS = ('django.contrib.auth.hashers.MD5PasswordHasher', )
	DEFAULT_FILE_STORAGE = 'inmemorystorage.InMemoryStorage'