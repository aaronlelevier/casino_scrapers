#!/bin/bash -lx

echo "PERSISTENT DEPLOY STARTED!"
source ~/.bashrc
echo "Node Version:"
node --version
echo "PSQL version"
psql --version

TAG="$1"

echo "CONFIG - SET SCRIPT CONFIGURATION"
export DJANGO_SETTINGS_MODULE='bigsky.settings.persistent'

PROJECT_DIR=/var/www

echo "PROJECT DIR - CHECK IF PERSISTENT PROJECT DIRECTORY EXISTS"
if [  ! -d "${PROJECT_DIR}/persistent" ];
    then
        echo "PERSISTENT DIR DOES NOT EXIST"
        mkdir ${PROJECT_DIR}/persistent
    else
        echo "PERSISTENT DIR EXISTS"
fi
cd ${PROJECT_DIR}/persistent
TEST=$?; if [ "$TEST" == 1 ]; then echo "mkdir failed"; exit $TEST; fi

echo "GIT - PULL/CLONE REPO"

wait
rm -rf bsrs
TEST=$?; if [ "$TEST" == 1 ]; then echo "rm failed"; exit $TEST; fi

wait
echo "GIT - CLONE REPO"
git clone git@github.com:bigskytech/bsrs.git
TEST=$?; if [ "$TEST" == 1 ]; then echo "git clone failed"; exit $TEST; fi

cd bsrs

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

if [ -n "$1" ]; then
  git checkout $TAG
fi

echo "GIT TAG"
git describe --tags

cd bigsky/

echo "EMBER"

cd ../../bsrs-ember

wait
echo "YARN (NPM) INSTALL"
rm -rf node_modules/bsrs-components
yarn cache clean
bower cache clean
yarn install
TEST=$?; if [ "$TEST" == 1 ]; then echo "yarn install failed"; exit $TEST; fi


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
