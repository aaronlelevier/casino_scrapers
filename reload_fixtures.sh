#!/bin/bash -lx

cd bsrs-django/bigsky

dropdb ci
wait
createdb ci
wait
./manage.py migrate
wait
./manage.py loaddata fixtures/states.json
wait
./manage.py loaddata fixtures/jenkins.json
wait
./manage.py loaddata fixtures/jenkins_custom.json
wait
./manage.py loaddata fixtures/tickets.json