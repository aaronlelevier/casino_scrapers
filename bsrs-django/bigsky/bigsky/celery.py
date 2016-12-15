from __future__ import absolute_import

import os
import platform

from celery import Celery

from django.conf import settings


# set the default Django settings module for the 'celery' program.
django_settings = 'bigsky.settings'
# if we're on Jenkins, default to the "deploy" settings file
if platform.system() != "Darwin":
    django_settings += '.deploy'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', django_settings)

app = Celery('bigsky', backend='redis://localhost', broker='redis://localhost')

# Using a string here means the worker will not have to
# pickle the object when using Windows.
app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

CELERY_ROUTES = {
    settings.CELERY_DEFAULT_QUEUE: 'medium-priority',
}
