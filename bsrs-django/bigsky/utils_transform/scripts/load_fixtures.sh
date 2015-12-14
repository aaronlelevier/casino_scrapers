#!/bin/bash -lx

echo "LOAD ANY FIXTURES THAT WILL NOT BE CREATED FROM A \
DOMINO -> TO -> DJANGO INSERT"

export DJANGO_SETTINGS_MODULE='bigsky.settings.persistent'

export DB_NAME=persistent
export DB_USER=bsdev

dropdb $DB_NAME -U $DB_USER
wait
createdb $DB_NAME -U $DB_USER -O $DB_USER

wait
source ../venv/bin/activate

./manage.py loaddata fixtures/translation.json
./manage.py loaddata utils_transform/fixtures/location_levels.json
./manage.py loaddata utils_transform/fixtures/contact_types.json

./manage.py create_single_person

./manage.py dumpdata --indent=2 > fixtures/persistent/persistent.json
