#!/bin/bash -lx

cd bsrs-django/bigsky

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
./manage.py loaddata fixtures/jenkins.json