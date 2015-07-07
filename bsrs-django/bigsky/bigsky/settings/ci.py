from .base import *

SECRET_KEY = '&8g%ple@(yc11&hb*k!zu2&e+wgaggk79_k(3=!w2ngv!5qh5&'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', 
        'NAME': 'db_name',
        'USER': '',
        'PASSWORD': '',
        'HOST': 'localhost',                      
        'PORT': '5432',
    }
}