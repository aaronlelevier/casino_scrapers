#!/bin/bash -lx
echo "DEPLOY STARTED!"

NEW_UUID=$(( ( RANDOM  )  + 1 ))

PORT=$((8003))

echo "UWSGI PROCESS RUNNING BEFORE KILL:"
fuser $PORT/tcp

echo "UWSGI KILL:"
fuser -k $PORT/tcp

wait
echo "THERE SHOULD BE NO UWSGI HERE:"
fuser $PORT/tcp

cd /www/django/releases/python3
rm -rf ./*/

wait
echo "CURRENT /www/django/releases/python3/ CONTENTS:"
ls

git clone -b python3 git@github.com:bigskytech/bsrs.git $NEW_UUID

cd $NEW_UUID
cd bsrs-ember
npm install --no-optional

./node_modules/ember-cli/bin/ember build --env=production

cd ../bsrs-django
rm -rf venv*
virtualenv -p /usr/local/bin/python3 venv3
venv3/bin/pip install -r requirements.txt

source venv3/bin/activate
echo "PYTHONPATH:"
python -c "import sys; print(sys.path)"

DB_NAME="staging"
export PGPASSWORD=tango
dropdb $DB_NAME -U bsdev
createdb $DB_NAME -U bsdev -O bsdev

cd bigsky/
export DJANGO_SETTINGS_MODULE='bigsky.settings.staging'
../venv3/bin/python manage.py makemigrations
../venv3/bin/python manage.py migrate

../venv3/bin/python manage.py loaddata fixtures/jenkins.json
../venv3/bin/python manage.py loaddata fixtures/jenkins_custom.json

cp -r ../../bsrs-ember/dist/assets .
cp -r ../../bsrs-ember/dist/fonts .
cp -r ../../bsrs-ember/dist/index.html templates

uwsgi --http :$PORT \
    --wsgi-file bigsky.wsgi \
    --virtualenv /www/django/releases/python3/$NEW_UUID/bsrs-django/venv3 \
    --daemonize /tmp/python3/bigsky.log \
    --static-map /assets=/www/django/releases/python3/$NEW_UUID/bsrs-django/bigsky \
    --static-map /fonts=/www/django/releases/python3/$NEW_UUID/bsrs-django/bigsky \
    --check-static /www/django/releases/python3/$NEW_UUID/bsrs-django/bigsky


wait
echo "SHOW UWSGI PROCESSES:"
ps ax | grep uwsgi

echo "DEPLOY FINISHED!"
exit 0