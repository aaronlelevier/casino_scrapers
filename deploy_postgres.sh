#!/bin/bash -lx

echo "DEPLOY STARTED!"

echo "GLOBAL VARIABLES"
UWSGI_PORT=$((8000))
echo "UWSGI_PORT: $UWSGI_PORT"
NEW_UUID=$(( ( RANDOM  )  + 1 ))
echo "NEW_UUID: $NEW_UUID"

function gitClone {
    git clone git@github.com:bigskytech/bsrs.git $NEW_UUID
    RESULT=$?
    if [ "$RESULT" == 1 ]; then
      echo "git clone failed"
      exit $RESULT
    fi
}

function npmInstall {
    npm install
    RESULT=$?
    if [ "$RESULT" == 1 ]; then
      echo "npm install  failed"
      exit $RESULT
    fi
}

function stopUwsgi {
    echo "KILL UWSGI PROCESSES"
    killall -s INT uwsgi
}

function buildEmber {
    ./node_modules/ember-cli/bin/ember build --env=production
    RESULT=$?
    if [ "$RESULT" == 1 ]; then
      echo "uWSGI failed"
      exit $RESULT
    fi

}

function buildVirtualenv {
    echo "CREATE VIRTUALENV AND PIP DEPENDENCIES"
    DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
    echo $DIR
    rm -rf venv
    virtualenv venv
    venv/bin/pip install -r requirements.txt
    RESULT=$?
    if [ "$RESULT" == 1 ]; then
      echo "uWSGI failed"
      exit $RESULT
    fi
    echo "CURRENT FILES:"
    ls -a
    echo "PIP FREEZE:"
    venv/bin/pip freeze
}

function dropCreateDB {
    DB_NAME="staging"
    echo "DB NAME TO DROP: $DB_NAME"
    export PGPASSWORD=tango
    dropdb $DB_NAME -U bsdev
    echo "$DB_NAME dropped"
    createdb $DB_NAME -U bsdev -O bsdev
    echo "$DB_NAME created"
    RESULT=$?
    if [ "$RESULT" == 1 ]; then
      echo "uWSGI failed"
      exit $RESULT
    fi
}

function runMigrations {
    echo "RUN DATABASE MIGRATIONS"
    export DJANGO_SETTINGS_MODULE='bigsky.settings.staging'
    ../venv/bin/python manage.py collectstatic --noinput
    rm -rf */migrations
    ../venv/bin/python manage.py makemigrations accounting contact location order person role session util
    ../venv/bin/python manage.py migrate
    ../venv/bin/python manage.py loaddata fixtures/postgres.json
    RESULT=$?
    if [ "$RESULT" == 1 ]; then
      echo "uWSGI failed"
      exit $RESULT
    fi
}

function copyStatic {
    echo "COPY OVER EMBER STATIC ASSETS"
    cp -r ../../bsrs-ember/dist/assets .
    cp -r ../../bsrs-ember/dist/fonts .
    cp -r ../../bsrs-ember/dist/index.html templates
    RESULT=$?
    if [ "$RESULT" == 1 ]; then
      echo "uWSGI failed"
      exit $RESULT
    fi
}

function startUwsgi {
    uwsgi --http :$UWSGI_PORT --wsgi-file bigsky_postgres.wsgi --virtualenv /www/django/releases/$NEW_UUID/bsrs-django/venv --daemonize /tmp/bigsky.log --static-map /assets=/www/django/releases/$NEW_UUID/bsrs-django/bigsky --static-map /fonts=/www/django/releases/$NEW_UUID/bsrs-django/bigsky --check-static /www/django/releases/$NEW_UUID/bsrs-django/bigsky
    UWSGI=$(ps aux | grep uwsgi)
    echo $UWSGI
    RESULT=$?
    if [ "$RESULT" == 1 ]; then
      echo "uWSGI failed"
      exit $RESULT
    fi
}


cd /www/django/releases
gitClone

cd $NEW_UUID/
cd bsrs-ember/
npmInstall

stopUwsgi

buildEmber

cd ../bsrs-django
buildVirtualenv

dropCreateDB

cd bigsky/
runMigrations

copyStatic

startUwsgi

echo "DEPLOY FINISHED!"
exit 0
