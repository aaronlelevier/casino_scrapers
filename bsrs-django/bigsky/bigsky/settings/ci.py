from .base import *

SECRET_KEY = '&8g%ple@(yc11&hb*k!zu2&e+wgaggk79_k(3=!w2ngv!5qh5&'

LOGGING = None

TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'

NOSE_ARGS = [
    '--with-coverage',
    '--cover-package=bsrsadmin.session',
]

DEBUG = True
DATABASES['default'] = {
    'ENGINE': 'django.db.backends.sqlite3',
    'NAME': 'tests.db',
}
PASSWORD_HASHERS = ('django.contrib.auth.hashers.MD5PasswordHasher', )
DEFAULT_FILE_STORAGE = 'inmemorystorage.InMemoryStorage'