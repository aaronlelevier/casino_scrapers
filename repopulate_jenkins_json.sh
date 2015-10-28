#!/bin/bash -lx

cd bsrs-django/bigsky
wait
dropdb ci
wait
createdb ci
wait
./manage.py makemigrations accounting category contact generic location order person session third_party ticket translation utils
wait
./manage.py migrate
wait
./manage.py loaddata fixtures/currency.json
./manage.py loaddata fixtures/category.json
./manage.py loaddata fixtures/third_party.json
wait
./manage.py create_all_people
wait
./manage.py dumpdata --indent=2 > fixtures/jenkins.json
wait
./manage.py create_tickets
wait
./manage.py dumpdata --indent=2 > fixtures/tickets.json