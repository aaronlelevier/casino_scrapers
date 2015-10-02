How to provision?
-----------------

.. code-block::

    sudo apt-get update
    sudo apt-get install
    sudo apt-get install build-essential python-setuptools python-dev libffi-dev libevent-dev
    sudo easy_install pip
    sudo pip install setuptools --no-use-wheel --upgrade
    sudo pip install virtualenv

    # special User to run the webserver process
    sudo useradd web   
    sudo groupadd www-data
    sudo usermod -a -G www-data web
    sudo passwd web 
    sudo adduser web sudo 
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

    # Postgres 
    # (b/c pip install will fail w/o it b/c psycogp2)
    postgresql-9.1
    postgresql-server-dev-9.1


Build Node
----------

.. code-block::

    # Install Node/npm globally

    mkdir /home/web/node_modules/
    cd /home/web/node_modules/

    wget 'https://nodejs.org/dist/v0.12.7/node-v0.12.7.tar.gz'
    tar xvzf node-v0.12.7.tar.gz

    # move the extracted tarball into a folder called 'node'
    mv node-v0.12.7 node

    # now link node/npm
    ls -s /home/vagrant/node_modules/node /usr/bin/node
    ls -s /home/vagrant/node_modules/npm /usr/bin/npm

    # check if installed ok?
    node --version
    which node
    which npm

    # if fails, may need to clean npm
    sudo npm cache clean -f

    # global install bower
    sudo npm install -g bower

    # PhaontomJs
    sudo npm install -g phantomjs
    vagrant reload


Nginx
-----

.. code-block::

    sudo apt-get install nginx
    sudo service nginx start
    ifconfig eth0 | grep inet | awk (print $2)


Postgres
--------

Install ``psql`` and ``postgres DB server``

.. code-block::

    # install psql
    sudo apt-get install postgresql-client-common

    # install postgres
    sudo apt-get install postgresql-9.1
    sudo apt-get install postgresql-contrib
    sudo apt-get install postgresql-client
    sudo apt-get install postgresql-server-dev-9.1

Posgres Configuration

.. code-block::

    # create DB, and set User password if unknown
    sudo su postgres
    psql
    CREATE DATABASE staging;
    CREATE USER bsdev WITH PASSWORD 'tango';
    GRANT ALL PRIVILEGES ON DATABASE "staging" TO bsdev;
    ALTER ROLE bsdev CREATEDB;
    # HStore required extension
    CREATE EXTENSION hstore
    \q

**Web User Configuration**

The web user running the deploy script will also have to be 
created as a postgres user in order to run:

``createdb <db_name>`` and ``dropdb <db_name>`` from the command line.

**Application Configurations**

**Note:** when running ``makemigrations`` in postgres-9.1 vs. postgres-9.3 they are different
and they will fail when running `/.manage.py migrate`

.. code-block::

    pip install psycopg2
    
    # run migrations
    ./manage.py makemigrations accounting category contact generic location order person session translation utils
    ./manage.py migrate
