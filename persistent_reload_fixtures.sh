#!/bin/bash -lx

export DJANGO_SETTINGS_MODULE='bigsky.settings.persistent'

cd bsrs-django/bigsky

dropdb persistent
wait
createdb persistent
wait
./manage.py migrate
wait
./manage.py create_single_person
wait
./manage.py dumpdata --indent=2 > fixtures/persistent/persistent.json
