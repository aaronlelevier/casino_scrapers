#!/bin/bash -lx

echo "sandbox sandbox STARTED!"#!/bin/bash -lx

wait
echo "UWSGI - START/RELOAD"
sudo kill -INT `cat /var/run/nginx-sandbox.pid`
sleep 15s


echo "CONFIG - SET SCRIPT CONFIGURATION"
export DJANGO_SETTINGS_MODULE='bigsky.settings.sandbox'

PROJECT_DIR=/var/www

echo "PROJECT DIR - CHECK IF sandbox PROJECT DIRECTORY EXISTS"
if [  ! -d "${PROJECT_DIR}/sandbox" ];
    then
        echo "DOES NOT EXIST"
        mkdir ${PROJECT_DIR}/sandbox
    else
        echo "EXISTS"
fi
cd ${PROJECT_DIR}/sandbox
TEST=$?; if [ "$TEST" == 1 ]; then echo "mkdir failed"; exit $TEST; fi

wait
rm -rf bsrs
TEST=$?; if [ "$TEST" == 1 ]; then echo "rm failed"; exit $TEST; fi


wait
echo "GIT - CLONE REPO"
git clone -b mobile-ps git@github.com:bigskytech/bsrs.git
TEST=$?; if [ "$TEST" == 1 ]; then echo "git clone failed"; exit $TEST; fi

echo "DJANGO"

cd bsrs/bsrs-django
virtualenv -p /usr/local/bin/python3.4 venv
TEST=$?; if [ "$TEST" == 1 ]; then echo "create virtualenv failed"; exit $TEST; fi

wait
venv/bin/pip3 install -r requirements.txt
TEST=$?; if [ "$TEST" == 1 ]; then echo "pip install failed"; exit $TEST; fi


cd bigsky/

echo "DJANGO - MIGRATE DATABASE SCHEMA"

DB_NAME="sandbox"
export PGPASSWORD=tango
psql -U bsdev -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity \
WHERE pg_stat_activity.datname = '${DB_NAME}' AND pid <> pg_backend_pid();"
wait
dropdb $DB_NAME -U bsdev
wait
createdb $DB_NAME -U bsdev -O bsdev
TEST=$?; if [ "$TEST" == 1 ]; then echo "create db failed"; exit $TEST; fi


wait
../venv/bin/python manage.py makemigrations accounting category contact dt dtd generic location person routing session tenant third_party ticket translation utils work_order work_request
TEST=$?; if [ "$TEST" == 1 ]; then echo "makemigrations failed"; exit $TEST; fi


wait
../venv/bin/python manage.py migrate
TEST=$?; if [ "$TEST" == 1 ]; then echo "migrate failed"; exit $TEST; fi


echo "AFTER MIGRATIONS, LOAD LATEST FIXTURE DATA."
wait
cd ../../
DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi
. "$DIR/_load_fixtures_from_env.sh"
TEST=$?; if [ "$TEST" == 1 ]; then echo "load fixtures failed"; exit $TEST; fi


echo "EMBER"

cd ../../bsrs-ember

wait
echo "NPM INSTALL"
npm install --no-optional
TEST=$?; if [ "$TEST" == 1 ]; then echo "npm install failed"; exit $TEST; fi


wait
echo "EMBER BUILD"
./node_modules/ember-cli/bin/ember build --env=production
TEST=$?; if [ "$TEST" == 1 ]; then echo "ember build failed"; exit $TEST; fi


echo "COPY STATIC ASSETS FROM EMBER TO DJANGO SIDE"

cd ../bsrs-django/bigsky

wait
rm -rf templates/index.html
wait
rm -rf ember/*
rm -rf static/*
TEST=$?; if [ "$TEST" == 1 ]; then echo "rm old static failed"; exit $TEST; fi


wait
cp -r ../../bsrs-ember/dist/assets ember/assets
cp -r ../../bsrs-ember/dist/fonts ember/fonts
cp ../../bsrs-ember/dist/index.html templates
TEST=$?; if [ "$TEST" == 1 ]; then echo "cp new static failed"; exit $TEST; fi


wait
echo "DJANGO - COLLECTSTATIC"
../venv/bin/python manage.py collectstatic --noinput
TEST=$?; if [ "$TEST" == 1 ]; then echo "django collectstatic failed"; exit $TEST; fi

wait
echo "COPY MEDIA ASSETS TO JENKINS LOCATION"
cp -r media/* /var/www/media/sandbox/

echo "RELOAD SERVER SCRIPTS"

cd ../../builds/sandbox/

wait
sudo /usr/local/lib/sandbox/uwsgi/uwsgi --ini uwsgi.ini
TEST=$?; if [ "$TEST" == 1 ]; then echo "uwsgi failed"; exit $TEST; fi


wait
echo "NGINX - RESTART"
sudo cp ../nginx.conf /etc/nginx/nginx.conf
wait
sudo service nginx restart
TEST=$?; if [ "$TEST" == 1 ]; then echo "nginx failed"; exit $TEST; fi


echo "sandbox FINISHED!"
exit 0
