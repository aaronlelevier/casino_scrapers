#!/bin/bash -lx

cd bsrs-django/bigsky
wait
dropdb ci
wait
createdb ci
wait
./manage.py makemigrations accounting category contact generic location order person session translation utils
wait
./manage.py migrate
wait
./manage.py loaddata fixtures/currency.json
wait
./manage.py create_all_people
wait
./manage.py dumpdata --indent=2 > fixtures/jenkins.json