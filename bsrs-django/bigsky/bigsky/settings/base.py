import os
import platform


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
    'debug_toolbar',
    ]

LOCAL_APPS = [
    'accounting',
    'automation',
    'bigsky',
    'dt',
    'dtd',
    'category',
    'contact',
    'generic',
    'location',
    'person',
    'session',
    'tenant',
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
                'django.template.context_processors.static',
            ],
        },
    },
]

WSGI_APPLICATION = 'bigsky.wsgi.application'


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'ci',
        'USER': 'bsdev',
        'PASSWORD': 'tango',
        'HOST': os.environ.get('DATABASE_HOST', 'localhost'),
        'PORT': '5432',
    }
}


CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}


PASSWORD_HASHERS = (
    'django.contrib.auth.hashers.MD5PasswordHasher',
)

AUTH_PASSWORD_VALIDATORS = []


LANGUAGE_CODE = 'en'
LANGUAGE_CODE_NAME = 'English'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'ember'),
    os.path.join(BASE_DIR, 'source'),
    ]

STATIC_URL = '/static/'

STATIC_ROOT = os.path.join(BASE_DIR, 'static')

MEDIA_URL = '/media/'

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


### Native Configurations ###

LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_URL = '/logout/'

SESSION_COOKIE_AGE = 5400
SESSION_SAVE_EVERY_REQUEST = True

SYSTEM = platform.system()

### 3RD PARTY APPS ###

DEBUG_TOOLBAR_PATCH_SETTINGS = False


PAGE_SIZE = 10
MAX_PAGE_SIZE = 100
PAGE_SIZE_QUERY_PARAM = 'page_size'

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'utils.pagination.StandardPagination',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
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
TOP_LEVEL_CATEGORY_LABEL = 'Type'

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
# API filtering by User
LOCATION_FILTERING = True

### PERSON
PASSWORD_EXPIRE_DAYS = 90
MAX_PASSWORDS_STORED = 5
DEFAULT_PERSON_STATUS = 'Active'

### ROUTING
DEFAULT_PROFILE_FILTER_CONTEXT = "ticket.ticket"

### TENANT
DEFAULT_TENANT_COMPANY_NAME = "Andy's Pianos"

### THIRD PARTY
THIRD_PARTY_STATUS_DEFAULT = "active"

### TICKETS
ACTIVITY_DEFAULT_WEIGHT = 4
# Enables Permission filtering on Ticket API data
TICKET_FILTERING_ON = True

### WORK ORDER
DEFAULTS_WORKORDER_STATUS = "work_order.status.new"

### EMAIL ###
# django native settings for ``django.core.mail.mail_admins()``
# EMAIL_HOST_USER
# EMAIL_HOST_PASSWORD
