Notes
=====

BaseCamp
--------
Work w/ Toran for coordinating Django stuff

Dates are thought of somewhat more as reminder dates than due dates

Vagrant Random Commands
-----------------------
# restart vagrant
sudo shutdown -r now


Vagrant
-------
2 parts:
    1. what are the servers dependencies to run the web app at all?
    2. how do I copy the django server over n symlink nginx?


How to provision?
-----------------
sudo apt-get update
sudo apt-get install
sudo apt-get install build-essential python-setuptools python-dev libffi-dev libevent-dev
sudo easy_install pip
sudo pip install setuptools --no-use-wheel --upgrade
sudo pip install virtualenv

# special User to run the webserver process
sudo useradd web         
sudo usermod -a -G www-data web
sudo passwd web #pw=vagrant
sudo adduser web sudo #adds user to sudoers group
sudo deluser web sudo

# make User's Dir
sudo mkdir /home/<username>
sudo chown -R web:web web #w/i the user's home dir

# git config n ssh keys
sudo su web
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# then copy ssh key into github settings

# make a releases dir
# add 'web' user chown to /www/django/ dir
/www/django/releases
# permissions for this dir = drwxr-xr-x

# Nginx
sudo apt-get install nginx
sudo service nginx start
ifconfig eth0 | grep inet | awk (print $2)

# Postgres 
# (b/c pip install will fail w/o it b/c psycogp2)
postgresql-9.1
postgresql-server-dev-9.1

Migrations steps
----------------
# step 0: create a Dir w/ a unique name under /www/django/releases w/ unique name

# step 1: deployment automation:
git clone git@github.com:bigskytech/bsrs.git 20150715

# step 2: create virtualenv
# add pip reqs to virtualenv
venv/bin/pip install -r bsrs-django/requirements.txt

# step 3: migrate
cd into ../bsrs-django/bigsky/
python manage.py migrate --settings=bigsky.settings.ci

# start uWSGI
 uwsgi --http :8000 --wsgi-file /www/django/releases/20150715/bsrs-django/bigsky/bigskysgi









