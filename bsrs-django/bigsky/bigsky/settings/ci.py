from .base import *

### Application definition ###
CI_APPS = (
    'django_nose',
    'django_coverage',
    )

INSTALLED_APPS = INSTALLED_APPS + CI_APPS


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
    '--with-coverage',
    '--cover-package=accounting,category,contact,generic,location,order,person,session,translation,util',
]

DEFAULT_FILE_STORAGE = 'inmemorystorage.InMemoryStorage'
