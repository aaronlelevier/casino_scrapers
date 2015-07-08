from .base import *


LOGGING = None

TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'

NOSE_ARGS = [
    '--with-coverage',
    '--cover-package=bigsky,contact,location,person,role,session,util',
]

DEBUG = True
DATABASES['default'] = {
    'ENGINE': 'django.db.backends.sqlite3',
    'NAME': 'tests.db',
}
PASSWORD_HASHERS = ('django.contrib.auth.hashers.MD5PasswordHasher', )
DEFAULT_FILE_STORAGE = 'inmemorystorage.InMemoryStorage'