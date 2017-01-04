from .base import *


LOCATION_FILTERING = False

TICKET_FILTERING_ON = False

CI_APPS = [
    'nose',
    'django_nose',
    'django_coverage',
    ]

INSTALLED_APPS = INSTALLED_APPS + CI_APPS

TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'

NOSE_ARGS = [
    '--nologcapture',
    '--exclude-dir={}'.format(os.path.join(BASE_DIR, "sc/tests")),
    '--exclude-dir={}'.format(os.path.join(BASE_DIR, "utils_transform/tcategory/tests")),
    '--exclude-dir={}'.format(os.path.join(BASE_DIR, "utils_transform/tlocation/tests")),
    '--exclude-dir={}'.format(os.path.join(BASE_DIR, "utils_transform/tperson/tests")),
    '--exclude-dir={}'.format(os.path.join(BASE_DIR, "utils_transform/trole/tests")),
    '--exclude-dir={}'.format(os.path.join(BASE_DIR, "utils_transform/tticket/tests")),
    '--cover-package=accounting,bigsky,category,contact,generic,location,order,person,session,third_party,ticket,translation,utils,work_request',
]

### ATTACHMENTS
DEFAULT_TEST_FILE = os.path.join(MEDIA_ROOT, "test_in/aaron.jpeg")
DEFAULT_TEST_IMAGE = os.path.join(MEDIA_ROOT, "test_in/es.csv")
