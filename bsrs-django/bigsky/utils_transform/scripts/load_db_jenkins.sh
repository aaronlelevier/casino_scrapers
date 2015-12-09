#!/bin/bash -lx

printf "LOAD 'transforms' DATABASE \n"
printf "MUST RUN FROM './manage.py' DIR LEVEL!!! \n"

DB_NAME="transforms"

export PGPASSWORD=tango
wait
dropdb $DB_NAME -U bsdev
wait
createdb $DB_NAME -U bsdev -O bsdev
wait
psql -d transforms -f utils_transform/transforms.sql
