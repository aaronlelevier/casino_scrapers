#!/bin/bash -lx

echo "PERSISTENT DEPLOY STARTED!"

echo "CONFIG - SET SCRIPT CONFIGURATION"
PORT=$((8003))
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


echo "GIT - PULL/CLONE REPO"
if [  -d "/www/django/releases/persistent/bsrs" ]; 
    then
        echo "BSRS REPO EXISTS"
        cd bsrs
        git checkout .
        git pull
        git checkout python3
    else
        echo "BSRS REPO DOES NOT EXIST"
        git clone git@github.com:bigskytech/bsrs.git
        cd bsrs
        git checkout python3
fi


echo "EMBER - BUILD"
cd bsrs-ember
npm install --no-optional
./node_modules/ember-cli/bin/ember build --env=production


cd ../bsrs-django
if [  -d "/www/django/releases/persistent/bsrs/bsrs-django/venv" ]; 
    then
        echo "VIRTUALENV EXISTS"
    else
        echo "VIRTUALENV DOES NOT EXIST"
        virtualenv -p /usr/local/bin/python3.4 venv
fi
venv/bin/pip3 install -r requirements.txt


wait
echo "DJANGO - MIGRATE DATABASE SCHEMA"
cd bigsky/
../venv/bin/python manage.py makemigrations
../venv/bin/python manage.py migrate


wait
echo "EMBER - COPY STATIC ASSETS FROM EMBER TO DJANGO SIDE"
rm -rf -rf assets
rm -rf -rf templates/index.html
wait
rm -rf ../../bsrs-django/bigsky/ember/*

cp -r ../../bsrs-ember/dist/assets ember/assets
cp -r ../../bsrs-ember/dist/fonts ember/fonts
cp ../../bsrs-ember/dist/index.html templates


wait
echo "DJANGO - COLLECTSTATIC"
../venv/bin/python manage.py collectstatic --noinput


wait
echo "UWSGI - START/RELOAD"
cd ../../python3/
ls /tmp/bigsky-master.pid
if [ $? -eq 0 ];
    then
        sudo /usr/local/lib/uwsgi/uwsgi --reload /tmp/bigsky-master.pid
    else
        sudo /usr/local/lib/uwsgi/uwsgi --ini uwsgi.ini
fi


echo "NGINX - RESTART"
bash restart_nginx.sh

echo "DEPLOY FINISHED!"
exit 0
