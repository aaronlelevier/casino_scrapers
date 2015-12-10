#!/bin/bash -lx

printf "LOAD 'transforms' DATABASE \n"
printf "MUST RUN FROM './manage.py' DIR LEVEL!!! \n"

export DB_NAME=transforms
export DB_USER=bsdev
export PGPASSWORD=tango

echo "CREATE FRESH DATABASE: '${DB_NAME}'"
wait
dropdb $DB_NAME -U $DB_USER
wait
createdb $DB_NAME -U $DB_USER -O $DB_USER

echo "LOAD TABLES TO '${DB_NAME}' DATABASE"
wait
psql -d $DB_NAME -f utils_transform/transforms.sql

echo "OUTPUT TABLES CREATED"
wait
psql -U $DB_USER -d $DB_NAME -c "\dt"
