from .base import *


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', 
        'NAME': os.environ.get('BSRS_DB_LOCAL_NAME', 'ci'),
        'USER': os.environ.get('BSRS_DB_LOCAL_USER', 'bsdev'),
        'PASSWORD': os.environ.get('BSRS_DB_LOCAL_NAME', 'tango'),
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

if 'test' in sys.argv:
    from .ci import *