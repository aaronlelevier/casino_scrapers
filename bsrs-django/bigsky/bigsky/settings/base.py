import os


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

SECRET_KEY = os.environ.get('BSRS_SECRET_KEY', '&8g%ple@(yc11&hb*k!zu2&e+wgaggk79_k(3=!w2ngv!5qh5&')

SITE_ID = 1

DEBUG = True

ALLOWED_HOSTS = ['*']


### Application definition ###
DEFAULT_APPS = (
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
    )

THIRD_PARTY_APPS = (
    'psycopg2',
    'corsheaders',
    'rest_framework',
    'debug_toolbar',
    )

LOCAL_APPS = (
    'accounting',
    'category',
    'contact',
    'generic',
    'location',
    'order',
    'person',
    'session',
    'third_party',
    'ticket',
    'translation',
    'utils',
    )

INSTALLED_APPS = DEFAULT_APPS + THIRD_PARTY_APPS + LOCAL_APPS


MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # Translation Req
    'django.middleware.locale.LocaleMiddleware',
)

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
            ],
        },
    },
]

WSGI_APPLICATION = 'bigsky.wsgi.application'

# Must Override!
DATABASES = {}

# AbstractUser Config
AUTH_USER_MODEL = 'person.Person'

LANGUAGE_CODE = 'en'
LANGUAGE_CODE_NAME = 'English'

TIME_ZONE = 'America/Los_Angeles'

USE_I18N = True

USE_L10N = True

USE_TZ = True


STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'ember'),
    )

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

REST_FRAMEWORK = {
    'PAGINATE_BY': 10,
    'PAGINATE_BY_PARAM': 'page_size',
    'MAX_PAGINATE_BY': 100,
    # 'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'rest_framework_filters.backends.DjangoFilterBackend',
    )
}

CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_ALLOW_ALL = False
CORS_ORIGIN_REGEX_WHITELIST = ('^https?://(\w+\.)?bs-webdev03.bigskytech\.com:8000$', ) #staging

# get w/ Aaron to understand what settings people run for local dev
# CORS_ORIGIN_REGEX_WHITELIST = ('^https?://localhost:\d{4}$',
#    '^https?://192\.168\.\d{1,3}\.\d{1,3}:\d{4}$', )


################
# APP SETTINGS #
################

### CATEGORY
TOP_LEVEL_CATEGORY_LABEL = 'type'

### LOCATION
DEFAULT_LOCATION_STATUS = 'Open'
DEFAULT_LOCATION_TYPE = 'big_store'

### PERSON
PASSWORD_EXPIRE_DAYS = 90
MAX_PASSWORDS_STORED = 5

### THIRD PARTY
THIRD_PARTY_STATUS_DEFAULT = "active"
