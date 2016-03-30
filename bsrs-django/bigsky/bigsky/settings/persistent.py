from .prod import *


PERSISTENT_LOCAL_APPS = [
    'utils_transform.tlocation',
    'utils_transform.tcategory',
    'utils_transform.trole',
    'utils_transform.tperson',    
    ]

INSTALLED_APPS = DEFAULT_APPS + THIRD_PARTY_APPS + LOCAL_APPS + PERSISTENT_LOCAL_APPS


DATABASES['default'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
#     'NAME': 'persistent',
    'NAME': 'ci',
    'USER': 'bsdev',
    'PASSWORD': 'tango',
    'HOST': 'localhost',
    'PORT': '5432',
}

DATABASES['transforms'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': 'transforms',
    'USER': 'bsdev',
    'PASSWORD': 'tango',
    'HOST': 'localhost',
    'PORT': '5432',
}

DATABASE_ROUTERS = ['bigsky.db_router.TransformRouter', 'bigsky.db_router.DefaultRouter']


MEDIA_ROOT = "/var/www/media/persistent/"
STATIC_ROOT = "/var/www/static/persistent/"

LOGGING_DIR = os.path.join(os.path.dirname(BASE_DIR), "log") # ../bsrs-django/log/

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format' : "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
            'datefmt' : "%d/%b/%Y %H:%M:%S"
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOGGING_DIR, 'debug.log'),
            'formatter': 'verbose'
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
        'bigsky': {
            'handlers': ['file'],
            'level': 'DEBUG'
        }
    }
}