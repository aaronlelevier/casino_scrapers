from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', 
        'NAME': 'local', # Either create this DB on your machine, or replace 
        'USER': '',		 # this with the name of your Postgres Django Dev DB.
        'PASSWORD': '',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

INSTALLED_APPS += (
    'django_extensions',
    )


if 'test' in sys.argv:
	TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'

	NOSE_ARGS = [
	    '--cover-package=contact,location,order,person,role,session,util',
	]

	PASSWORD_HASHERS = ('django.contrib.auth.hashers.MD5PasswordHasher', )
	DEFAULT_FILE_STORAGE = 'inmemorystorage.InMemoryStorage'