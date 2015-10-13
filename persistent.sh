#!/bin/bash -lx

echo "PERSISTENT DEPLOY STARTED!"


echo "CONFIG - SET SCRIPT CONFIGURATION"
export DJANGO_SETTINGS_MODULE='bigsky.settings.persistent'


echo "PROJECT DIR - CHECK IF PERSISTENT PROJECT DIRECTORY EXISTS"
if [  ! -d "/www/django/releases/persistent" ]; 
    then
        echo "DOES NOT EXIST"
        mkdir /www/django/releases/persistent
    else
        echo "EXISTS"
fi
cd /www/django/releases/persistent
TEST=$?; if [ "$TEST" == 1 ]; then echo "mkdir failed"; exit $TEST; fi


echo "GIT - PULL/CLONE REPO"
if [  -d "/www/django/releases/persistent/bsrs" ]; 
    then
        echo "BSRS REPO EXISTS"
        cd bsrs
        git checkout .
        git checkout master
        git pull
    else
        echo "BSRS REPO DOES NOT EXIST"
        git clone git@github.com:bigskytech/bsrs.git
        cd bsrs
fi
TEST=$?; if [ "$TEST" == 1 ]; then echo "git pull/clone failed"; exit $TEST; fi


echo "DJANGO"

cd bsrs-django

if [  -d "/www/django/releases/persistent/bsrs/bsrs-django/venv" ]; 
    then
        echo "VIRTUALENV EXISTS"
    else
        echo "VIRTUALENV DOES NOT EXIST"
        virtualenv -p /usr/local/bin/python3.4 venv
fi
TEST=$?; if [ "$TEST" == 1 ]; then echo "create virtualenv failed"; exit $TEST; fi

wait
venv/bin/pip3 install -r requirements.txt
TEST=$?; if [ "$TEST" == 1 ]; then echo "pip install failed"; exit $TEST; fi


cd bigsky/

wait
echo "DJANGO - MIGRATE DATABASE SCHEMA"
../venv/bin/python manage.py makemigrations accounting category contact generic location order person session third_party ticket translation utils
TEST=$?; if [ "$TEST" == 1 ]; then echo "makemigrations failed"; exit $TEST; fi


wait
../venv/bin/python manage.py migrate
TEST=$?; if [ "$TEST" == 1 ]; then echo "migrate failed"; exit $TEST; fi


echo "AFTER MIGRATIONS, LOAD LATEST FIXTURE DATA."
wait
../venv/bin/python manage.py loaddata fixtures/persistent.json
wait
../venv/bin/python manage.py loaddata fixtures/jenkins_custom.json


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


echo "RELOAD SERVER SCRIPTS"

cd ../../builds/persistent/

wait
echo "UWSGI - START/RELOAD"
sudo /usr/local/lib/persistent/uwsgi/uwsgi --ini uwsgi.ini
sudo touch /tmp/bigsky-master-persistent.pid
TEST=$?; if [ "$TEST" == 1 ]; then echo "uwsgi failed"; exit $TEST; fi


wait
echo "NGINX - RESTART"
sudo cp ../nginx.conf /etc/nginx/nginx.conf
wait
sudo service nginx restart
TEST=$?; if [ "$TEST" == 1 ]; then echo "nginx failed"; exit $TEST; fi


echo "PERSISTENT FINISHED!"
exit 0