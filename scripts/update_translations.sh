#!/bin/bash -lx

BUILD=$1

export DJANGO_SETTINGS_MODULE='bigsky.settings.$BUILD'
cd /var/www/$BUILD/bsrs/bsrs-django/bigsky
source ../venv/bin/activate
./manage.py update_translations
