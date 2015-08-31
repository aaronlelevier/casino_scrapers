from .base import *


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', 
        'NAME': os.environ.get('BSRS_DB_CI_NAME', 'ci'),
        'USER': os.environ.get('BSRS_DB_CI_USER', 'bsdev'),
        'PASSWORD': os.environ.get('BSRS_DB_CI_NAME', 'tango'),
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'

NOSE_ARGS = [
    '--cover-package=accounting,contact,location,order,person,role,session,translation,util',
]

DEFAULT_FILE_STORAGE = 'inmemorystorage.InMemoryStorage'
