from .base import *


TICKET_FILTERING_ON = False

CI_APPS = [
    'nose',
    'django_nose',
    'django_coverage',
    ]

INSTALLED_APPS += CI_APPS

TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'

tlocation_test_dir = os.path.join(BASE_DIR, "utils_transform/tlocation/tests")
tcategory_test_dir = os.path.join(BASE_DIR, "utils_transform/tcategory/tests")

NOSE_ARGS = [
    '--nologcapture',
    '--exclude-dir={},{}'.format(tlocation_test_dir, tcategory_test_dir),
    '--cover-package=accounting,bigsky,category,contact,generic,location,order,person,session,\
third_party,ticket,translation,utils,work_request',
]

### ATTACHMENTS
DEFAULT_TEST_FILE = os.path.join(MEDIA_ROOT, "test_in/aaron.jpeg")
DEFAULT_TEST_IMAGE = os.path.join(MEDIA_ROOT, "test_in/es.csv")
