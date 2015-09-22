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
source /home/bsdev/.virtualenvs/bs_py34/bin/activate
pip3 install -r requirements.txt

cd bigsky/
export DJANGO_SETTINGS_MODULE='bigsky.settings.persistant'
./manage.py makemigrations
./manage.py migrate
./manage.py collectstatic --noinput

cp -r ../../bsrs-ember/dist/assets .
cp -r ../../bsrs-ember/dist/fonts .
cp -r ../../bsrs-ember/dist/index.html templates

/home/bsdev/misc/uwsgi-2.0.3/uwsgi --ini uwsgi.ini

service nginx restart

echo "DEPLOY FINISHED!"
exit 0
