#!/bin/bash -lx

cd bsrs-django/bigsky

dropdb ci
wait
createdb ci
wait
./manage.py migrate
wait
./manage.py loaddata fixtures/states.json
./manage.py loaddata fixtures/jenkins.json
./manage.py loaddata fixtures/jenkins_custom.json
./manage.py loaddata fixtures/tickets.json