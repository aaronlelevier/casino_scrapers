#!/bin/bash -lx

echo "DEPLOY STARTED!"

NEW_UUID=$(( ( RANDOM  )  + 1 ))

cd /www/django/releases

git clone git@github.com:bigskytech/bsrs.git $NEW_UUID

cd $NEW_UUID
cd bsrs-ember/
npm install

kill -9 `ps aux | grep uwsgi | awk '{print $2}'`

./node_modules/ember-cli/bin/ember build --env=production
cd ../

virtualenv venv
venv/bin/pip install -r bsrs-django/requirements.txt

cd bsrs-django/bigsky

../../venv/bin/python manage.py migrate --settings=bigsky.settings.ci
../../venv/bin/python manage.py loaddata fixtures/jenkins.json --settings=bigsky.settings.ci

cp -r ../../bsrs-ember/dist/assets .
cp -r ../../bsrs-ember/dist/index.html templates

uwsgi --http :8000 --wsgi-file bigsky.wsgi --virtualenv /www/django/releases/$NEW_UUID/venv --daemonize /tmp/bigsky.log --static-map /assets=/www/django/releases/$NEW_UUID/bsrs-django/bigsky --check-static /www/django/releases/$NEW_UUID/bsrs-django/bigsky

echo "DEPLOY FINISHED!"
exit 0
