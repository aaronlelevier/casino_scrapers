import os


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

SECRET_KEY = os.environ.get('BSRS_SECRET_KEY', '&8g%ple@(yc11&hb*k!zu2&e+wgaggk79_k(3=!w2ngv!5qh5&')

SITE_ID = 1

DEBUG = True

ALLOWED_HOSTS = ['*']

# AbstractUser Config
AUTH_USER_MODEL = 'person.Person'

### Application definition ###
DEFAULT_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sitemaps',
    'django.contrib.flatpages',
    'django.contrib.postgres',
    ]

THIRD_PARTY_APPS = [
    'psycopg2',
    'corsheaders',
    'rest_framework',
    ]

LOCAL_APPS = [
    'accounting',
    'category',
    'contact',
    'generic',
    'location',
    'person',
    'session',
    'third_party',
    'ticket',
    'translation',
    'work_order',
    'work_request',
    'utils',
    ]

INSTALLED_APPS = DEFAULT_APPS + THIRD_PARTY_APPS + LOCAL_APPS


MIDDLEWARE_CLASSES = [
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # Translation Requirement
    'django.middleware.locale.LocaleMiddleware',
]

ROOT_URLCONF = 'bigsky.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
            ],
        },
    },
]

WSGI_APPLICATION = 'bigsky.wsgi.application'


# Must Override
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'ci',
        'USER': 'bsdev',
        'PASSWORD': 'tango',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}


# COMMENT OUT: ETL Domino -> to -> Django dome for the time being, so the ``transforms``
#   flat database is not needed for now.
# DATABASES['transforms'] = {
#     'ENGINE': 'django.db.backends.postgresql_psycopg2',
#     'NAME': 'transforms',
#     'USER': 'bsdev',
#     'PASSWORD': 'tango',
#     'HOST': 'localhost',
#     'PORT': '5432',
# }

# INSTALLED_APPS += ('utils_transform.tlocation',)

# DATABASE_ROUTERS = ['bigsky.db_router.TransformRouter', 'bigsky.db_router.DefaultRouter']



# Password validation (not in use in currently)
# https://docs.djangoproject.com/en/1.9/ref/settings/#auth-password-validators

PASSWORD_HASHERS = (
    'django.contrib.auth.hashers.MD5PasswordHasher',
)

AUTH_PASSWORD_VALIDATORS = []
# [
#     {
#         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
#     },
# ]



LANGUAGE_CODE = 'en'
LANGUAGE_CODE_NAME = 'English'

TIME_ZONE = 'America/Los_Angeles'

USE_I18N = True

USE_L10N = True

USE_TZ = True


STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'ember'),
    ]

STATIC_URL = '/static/'

STATIC_ROOT = os.path.join(BASE_DIR, 'static')

MEDIA_URL = '/media/'

MEDIA_ROOT = os.path.join(BASE_DIR, 'source')


### Native Configurations ###

LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_URL = '/logout/'


### FILES

MAX_UPLOAD_SIZE = 2621440 # 2621440 # default - aka: 2.5MB


### 3RD PARTY APPS ###

DEBUG_TOOLBAR_PATCH_SETTINGS = False


PAGE_SIZE = 10 
MAX_PAGE_SIZE = 100
PAGE_SIZE_QUERY_PARAM = 'page_size'

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'utils.pagination.StandardPagination',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'rest_framework_filters.backends.DjangoFilterBackend',
    )
}

CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_ALLOW_ALL = False
CORS_ORIGIN_REGEX_WHITELIST = (r'^https?://(\w+\.)?bs-webdev03.bigskytech\.com:8000$', ) #staging

# get w/ Aaron to understand what settings people run for local dev
# CORS_ORIGIN_REGEX_WHITELIST = ('^https?://localhost:\d{4}$',
#    '^https?://192\.168\.\d{1,3}\.\d{1,3}:\d{4}$', )


################
# APP SETTINGS #
################

### CATEGORY
TOP_LEVEL_CATEGORY_LABEL = 'type'

### GENERIC
ATTACHMENTS_DIRECTORY = os.path.join(MEDIA_ROOT, "attachments")
FILES_SUB_PATH = "attachments/files"
IMAGE_FULL_SUB_PATH = "attachments/images/full"
IMAGE_MEDIUM_SUB_PATH = "attachments/images/medium"
IMAGE_THUMBNAIL_SUB_PATH = "attachments/images/thumbnail"
# 2.5MB - 2621440
# 5MB   - 5242880
# 10MB  - 10485760
# 20MB  - 20971520
# 50MB  - 52428800
# 100MB - 104857600
# 250MB - 214958080
# 500MB - 429916160
MAX_UPLOAD_SIZE = 5242880

### ROLE
DEFAULT_ROLE = 'Administrator'

### LOCATION
DEFAULT_LOCATION_STATUS = 'admin.location.status.open'
DEFAULT_LOCATION_TYPE = 'big_store'
DEFAULT_LOCATION_LEVEL = 'Company'

### PERSON
PASSWORD_EXPIRE_DAYS = 90
MAX_PASSWORDS_STORED = 5
DEFAULT_PERSON_STATUS = 'Active'

### THIRD PARTY
THIRD_PARTY_STATUS_DEFAULT = "active"

### TICKETS
ACTIVITY_DEFAULT_WEIGHT = 4
DEFAULTS_TICKET_STATUS = "ticket.status.new"
TICKET_FILTERING_ON = False

### WORK ORDER
DEFAULTS_WORKORDER_STATUS = "work_order.status.new" 

### EMAIL ###
# django native settings for ``django.core.mail.mail_admins()``
# EMAIL_HOST_USER
# EMAIL_HOST_PASSWORD


### LOGGING ###
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


import logging, copy
from django.utils.log import DEFAULT_LOGGING

LOGGING = copy.deepcopy(DEFAULT_LOGGING)
LOGGING['filters']['suppress_deprecated'] = {
    '()': 'bigsky.settings.SuppressDeprecated'  
}
LOGGING['handlers']['console']['filters'].append('suppress_deprecated')

class SuppressDeprecated(logging.Filter):
    def filter(self, record):
        WARNINGS_TO_SUPPRESS = [
            'RemovedInDjango110Warning'
        ]
        # Return false to suppress message.
        return not any([warn in record.getMessage() for warn in WARNINGS_TO_SUPPRESS])
