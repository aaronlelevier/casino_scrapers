#!/bin/bash -lx

echo "DEPLOY STARTED!"

NEW_UUID=$(( ( RANDOM  )  + 1 ))

PORT=$((8000))

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
rm -rf venv
virtualenv -p /usr/local/bin/python3 venv
venv/bin/pip install -r requirements.txt

source venv/bin/activate
echo "PYTHONPATH:"
python -c "import sys; print(sys.path)"

DB_NAME="staging"
export PGPASSWORD=tango
dropdb $DB_NAME -U bsdev
createdb $DB_NAME -U bsdev -O bsdev

cd bigsky

rm -rf ember/*
rm -rf static/*
rm -rf templates/index.html

cp -r ../../bsrs-ember/dist/assets ember/assets
cp -r ../../bsrs-ember/dist/fonts ember/fonts
cp -r ../../bsrs-ember/dist/index.html templates

export DJANGO_SETTINGS_MODULE='bigsky.settings.staging'
../venv/bin/python manage.py makemigrations accounting category contact generic location order person session translation utils
../venv/bin/python manage.py migrate

wait
../venv/bin/python manage.py loaddata fixtures/jenkins.json
../venv/bin/python manage.py loaddata fixtures/jenkins_custom.json
../venv/bin/python manage.py collectstatic --noinput

wait
/usr/local/lib/uwsgi/uwsgi --http :$PORT \
    --wsgi-file bigsky.wsgi \
    --env DJANGO_SETTINGS_MODULE=bigsky.settings.staging \
    --home /home/bsdev/.virtualenvs/bs_py34/ \
    --static-map /static=/www/django/releases/python3/$NEW_UUID/bsrs-django/bigsky \
    --daemonize /tmp/bigsky-deploy.log \
    --check-static /www/django/releases/python3/$NEW_UUID/bsrs-django/bigsky

wait
echo "SHOW UWSGI PROCESSES:"
ps ax | grep uwsgi

echo "DEPLOY FINISHED!"
exit 0