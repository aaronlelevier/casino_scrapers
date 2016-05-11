import platform

from .prod import *

# Turn on for debug mode in 'debug_toolbar'
INTERNAL_IPS = ('127.0.0.1',)

PERSISTENT_APPS = [
    'utils_transform.tcategory',
    'utils_transform.tlocation',
    'utils_transform.tperson',    
    'utils_transform.trole',
    'utils_transform.tticket',
    ]

THIRD_PARTY_APPS = [
    'debug_toolbar',
    ]

MIDDLEWARE_CLASSES += [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    ]

INSTALLED_APPS = INSTALLED_APPS + PERSISTENT_APPS + THIRD_PARTY_APPS


DATABASES['default'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': 'persistent',
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


### LOGGING ###
if platform.system() == 'Linux':
    LOGGING_DIR = '/var/log/persistent/'
else:
    LOGGING_DIR = os.path.join(os.path.dirname(BASE_DIR), "log") # ../bsrs-django/log/

LOGGING_INFO_FILE = os.path.join(LOGGING_DIR, 'info.log')
LOGGING_REQUEST_FILE = os.path.join(LOGGING_DIR, 'request.log')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'standard': {
            'format': '%(asctime)s %(levelname)s %(name)s %(message)s'
        },
    },
    'handlers': {
        'default': {
            'level':'DEBUG',
            'class':'logging.handlers.RotatingFileHandler',
            'filename': LOGGING_INFO_FILE,
            'maxBytes': 1024*1024*5, # 5 MB
            'backupCount': 5,
            'formatter':'standard',
        },
        'request_handler': {
                'level':'DEBUG',
                'class':'logging.handlers.RotatingFileHandler',
                'filename': LOGGING_REQUEST_FILE,
                'maxBytes': 1024*1024*5, # 5 MB
                'backupCount': 5,
                'formatter':'standard',
        },
    },
    'loggers': {

        '': {
            'handlers': ['default'],
            'level': 'DEBUG',
            'propagate': True
        },
        'django.request': { # Stop SQL debug from logging to main logger
            'handlers': ['request_handler'],
            'level': 'DEBUG',
            'propagate': False
        },
    }
}
