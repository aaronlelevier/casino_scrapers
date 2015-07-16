#!/bin/bash -lx

echo "DEPLOY STARTED!"

killall -s INT uwsgi

NEW_UUID=$(( ( RANDOM  )  + 1 ))

cd /www/django/releases

git clone git@github.com:bigskytech/bsrs.git $NEW_UUID

cd $NEW_UUID
virtualenv venv
venv/bin/pip install -r bsrs-django/requirements.txt

cd bsrs-django/bigsky

../../venv/bin/python manage.py migrate --settings=bigsky.settings.ci

MIGRATE_EXIT=$?
if [ "$MIGRATE_EXIT" == 1 ]; then
  echo "DEPLOY MIGRATION FAILED!"
  exit $MIGRATE_EXIT
fi

uwsgi --http :8000 --wsgi-file bigsky.wsgi --virtualenv /www/django/releases/$NEW_UUID/venv --daemonize /tmp/bigsky.log

WSGI_EXIT=$?
if [ "$WSGI_EXIT" == 1 ]; then
  echo "WSGI FAILED!"
  exit $WSGI_EXIT
fi

echo "DEPLOY SUCCESSFUL!"
exit 0
