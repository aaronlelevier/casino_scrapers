#!/bin/bash -lx

printf "MUST RUN FROM './manage.py' DIR LEVEL!!! \n"

printf "DROP, CREATE, MIGRATE 'transforms' DATABASE \n"
printf "IGNORE STACK TRACE FOR 'sites' BECAUSE 'auth' ISN'T YET LOADED YET \n\n"

export DJANGO_SETTINGS_MODULE='bigsky.settings.persistent'

export DB_NAME=transforms
export DB_USER=bsdev

wait
source ../venv/bin/activate

dropdb $DB_NAME -U $DB_USER
wait
createdb $DB_NAME -U $DB_USER -O $DB_USER
wait
./manage.py migrate sites --database=$DB_NAME
./manage.py migrate auth --database=$DB_NAME

printf "\n MIGRATE '$DB_NAME' DATABASE SPECIFIC APPS \n\n"
./manage.py migrate tlocation --database=$DB_NAME

printf "\n OUTPUT MIGRATED TABLES \n\n"
wait
psql -d $DB_NAME -c "\dt"

printf "\n DUMP DATABASE FILE - SO IT CAN BE LOADED ON JENKINS \n\n"
wait
pg_dump -U $DB_USER $DB_NAME > utils_transform/$DB_NAME.sql
