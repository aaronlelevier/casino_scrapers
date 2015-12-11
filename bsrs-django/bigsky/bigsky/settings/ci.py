from .base import *


CI_APPS = (
    'django_nose',
    'django_coverage',
    )

INSTALLED_APPS = INSTALLED_APPS + CI_APPS

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
