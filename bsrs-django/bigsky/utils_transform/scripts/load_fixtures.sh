#!/bin/bash -lx

echo "LOAD ANY FIXTURES THAT WILL NOT BE CREATED FROM A \
DOMINO -> TO -> DJANGO INSERT"

export DJANGO_SETTINGS_MODULE='bigsky.settings.persistent'

export DB_NAME=persistent
export DB_NAME_DOMINO_TABLES=transforms
export DB_USER=bsdev

echo "DROP / CREATE $DB_NAME"
dropdb $DB_NAME -U $DB_USER
wait
createdb $DB_NAME -U $DB_USER -O $DB_USER

echo "DROP / CREATE $DB_NAME_DOMINO_TABLES"
wait
dropdb $DB_NAME_DOMINO_TABLES -U $DB_USER
wait
createdb $DB_NAME_DOMINO_TABLES -U $DB_USER -O $DB_USER
./manage.py migrate sites --database=$DB_NAME_DOMINO_TABLES
./manage.py migrate auth --database=$DB_NAME_DOMINO_TABLES
./manage.py migrate tlocation --database=$DB_NAME_DOMINO_TABLES

wait
./manage.py migrate

wait
./manage.py loaddata fixtures/translation.json
./manage.py loaddata utils_transform/tlocation/fixtures/location_levels.json
./manage.py loaddata utils_transform/tlocation/fixtures/contact_types.json

wait
./manage.py create_single_person

./manage.py dumpdata --indent=2 > fixtures/persistent/persistent.json
