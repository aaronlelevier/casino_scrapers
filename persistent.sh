#!/bin/bash -lx

echo "PERSISTENT DEPLOY STARTED!"

PORT=$((8002))

echo "UWSGI PROCESS RUNNING BEFORE KILL:"
fuser $PORT/tcp

echo "UWSGI KILL:"
fuser -k $PORT/tcp

wait
echo "SHOULD BE NO UWSGI PROCESSES HERE:"
fuser $PORT/tcp

if [  ! -d "/www/django/releases/persistent" ]; then
    mkdir /www/django/releases/persistent
fi

cd /www/django/releases/persistent

if [  -d "/www/django/releases/persistent/bsrs" ]; 
    then
        echo "BSRS REPO EXISTS"
        cd bsrs
        git checkout .
        git pull
    else
        echo "BSRS REPO DOES NOT EXIST"
        git clone git@github.com:bigskytech/bsrs.git
        cd bsrs
fi

cd bsrs-ember
npm install --no-optional

./node_modules/ember-cli/bin/ember build --env=production

cd ../bsrs-django
if [  -d "/www/django/releases/persistent/bsrs/bsrs-django/venv" ]; 
    then
        echo "VIRTUALENV EXISTS"
    else
        echo "VIRTUALENV DOES NOT EXIST"
        virtualenv venv
fi
venv/bin/pip install -r requirements.txt

DB_NAME="staging_persistant"
export PGPASSWORD=tango
dropdb $DB_NAME -U bsdev
createdb $DB_NAME -U bsdev -O bsdev

cd bigsky/
export DJANGO_SETTINGS_MODULE='bigsky.settings.staging'
../venv/bin/python manage.py makemigrations
../venv/bin/python manage.py migrate

../venv/bin/python manage.py loaddata fixtures/jenkins.json
../venv/bin/python manage.py loaddata fixtures/jenkins_custom.json

cp -r ../../bsrs-ember/dist/assets .
cp -r ../../bsrs-ember/dist/fonts .
cp -r ../../bsrs-ember/dist/index.html templates

uwsgi --http :$PORT \
    --wsgi-file bigsky.wsgi \
    --virtualenv /www/django/releases/persistent/bsrs/bsrs-django/venv \
    --daemonize /tmp/bigsky-persistent.log \
    --static-map /assets=/www/django/releases/persistent/bsrs/bsrs-django/bigsky \
    --static-map /fonts=/www/django/releases/persistent/bsrs/bsrs-django/bigsky \
    --check-static /www/django/releases/persistent/bsrs/bsrs-django/bigsky \
    --enable-threads

wait
echo "OUTPUT LOG:"
cat /tmp/bigsky-persistent.log

echo "DEPLOY FINISHED!"
exit 0
