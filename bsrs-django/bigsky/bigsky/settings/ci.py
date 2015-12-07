from .base import *


CI_APPS = [
    'django_nose',
    'django_coverage',
    ]

INSTALLED_APPS += CI_APPS

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
    '--nologcapture',
    '--with-coverage',
    '--cover-package=accounting,category,contact,generic,location,order,person,session,\
third_party,ticket,translation,utils',
]

### ATTACHMENTS
DEFAULT_TEST_FILE = os.path.join(BASE_DIR, "source/test_in/aaron.jpeg")
DEFAULT_TEST_IMAGE = os.path.join(BASE_DIR, "source/test_in/es.csv")
