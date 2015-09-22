#!/bin/bash -lx

echo "PERSISTENT DEPLOY STARTED!"

PORT=$((8003))

if [  ! -d "/www/django/releases/persistent" ]; then
    mkdir /www/django/releases/persistent
fi

cd /www/django/releases/persistent

if [  -d "/www/django/releases/persistent/bsrs" ]; 
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

cd bigsky/
export DJANGO_SETTINGS_MODULE='bigsky.settings.persistent'

wait
../venv/bin/python manage.py makemigrations
wait
../venv/bin/python manage.py migrate
wait
../venv/bin/python manage.py collectstatic --noinput

cp -r ../../bsrs-ember/dist/assets .
cp -r ../../bsrs-ember/dist/fonts .
cp -r ../../bsrs-ember/dist/index.html templates

/home/bsdev/misc/uwsgi-2.0.3/uwsgi --ini uwsgi.ini

service nginx restart

echo "DEPLOY FINISHED!"
exit 0
