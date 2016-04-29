#!/bin/bash -lx

export DJANGO_SETTINGS_MODULE='bigsky.settings.deploy'
cd /var/www/deploy/bsrs/bsrs-django/bigsky
source ../venv/bin/activate
./manage.py update_translations
