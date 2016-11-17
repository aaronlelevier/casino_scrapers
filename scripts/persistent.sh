#!/bin/bash -lx

echo "PERSISTENT DEPLOY STARTED!"


echo "CONFIG - SET SCRIPT CONFIGURATION"
export DJANGO_SETTINGS_MODULE='bigsky.settings.persistent'

PROJECT_DIR=/var/www

echo "PROJECT DIR - CHECK IF PERSISTENT PROJECT DIRECTORY EXISTS"
if [  ! -d "${PROJECT_DIR}/persistent" ];
    then
        echo "DOES NOT EXIST"
        mkdir ${PROJECT_DIR}/persistent
    else
        echo "EXISTS"
fi
cd ${PROJECT_DIR}/persistent
TEST=$?; if [ "$TEST" == 1 ]; then echo "mkdir failed"; exit $TEST; fi


echo "GIT - PULL/CLONE REPO"
if [  -d "${PROJECT_DIR}/persistent/bsrs" ];
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
TEST=$?; if [ "$TEST" == 1 ]; then echo "git pull/clone failed"; exit $TEST; fi


echo "DJANGO"

cd bsrs-django

wait
rm -rf venv
wait
virtualenv -p /usr/local/bin/python3.4 venv

wait
source venv/bin/activate
pip install -r requirements.txt
TEST=$?; if [ "$TEST" == 1 ]; then echo "pip install failed"; exit $TEST; fi


cd bigsky/

# NOTE: Need to manually migrate b/c this has an existing DB
# TODO: Squash migrations and correctly version control them to make this
#       process how it should be.
# wait
# ../venv/bin/python manage.py migrate
# TEST=$?; if [ "$TEST" == 1 ]; then echo "migrate failed"; exit $TEST; fi


echo "AFTER MIGRATIONS, LOAD LATEST FIXTURE DATA."
wait
# NOTE: remove for time being b/c DB already populated
# ../venv/bin/python manage.py loaddata fixtures/translation.json
# ../venv/bin/python manage.py loaddata fixtures/persistent/persistent.json
TEST=$?; if [ "$TEST" == 1 ]; then echo "load fixture failed"; exit $TEST; fi


echo "EMBER"

cd ../../bsrs-ember

wait
echo "NPM INSTALL"
rm -rf node_modules/bsrs-components
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
cp -r ../../bsrs-ember/dist/css ember/css
cp -r ../../bsrs-ember/dist/fonts ember/fonts
cp ../../bsrs-ember/dist/index.html templates
TEST=$?; if [ "$TEST" == 1 ]; then echo "cp new static failed"; exit $TEST; fi


wait
echo "DJANGO - COLLECTSTATIC"
../venv/bin/python manage.py collectstatic --noinput
TEST=$?; if [ "$TEST" == 1 ]; then echo "django collectstatic failed"; exit $TEST; fi

wait
echo "COPY MEDIA ASSETS TO JENKINS LOCATION"
cp -r media/* /var/www/media/persistent/

echo "RELOAD SERVER SCRIPTS"

cd ../../builds/persistent/

wait
echo "UWSGI - START/RELOAD"
sudo kill -INT `cat /var/run/nginx-persistent.pid`
wait
sudo /usr/local/lib/persistent/uwsgi/uwsgi --ini uwsgi.ini
TEST=$?; if [ "$TEST" == 1 ]; then echo "uwsgi failed"; exit $TEST; fi


wait
echo "NGINX - RESTART"
sudo cp ../nginx.conf /etc/nginx/nginx.conf
wait
sudo service nginx restart
TEST=$?; if [ "$TEST" == 1 ]; then echo "nginx failed"; exit $TEST; fi


echo "PERSISTENT FINISHED!"
exit 0
