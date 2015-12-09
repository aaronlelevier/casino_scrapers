#!/bin/bash -lx

printf "DROP, CREATE, MIGRATE 'transforms' DATABASE \n"
printf "MUST RUN FROM './manage.py' DIR LEVEL!!! \n"
printf "IGNORE STACK TRACE FOR 'sites' BECAUSE 'auth' ISN'T YET LOADED YET \n\n"

dropdb transforms
wait
createdb transforms
wait
./manage.py migrate sites --database=transforms
./manage.py migrate auth --database=transforms

printf "\n MIGRATE 'transforms' DATABASE SPECIFIC APPS \n\n"
./manage.py migrate tlocation --database=transforms

printf "\n OUTPUT MIGRATED TABLES \n\n"
wait
psql -d transforms -c "\dt"
