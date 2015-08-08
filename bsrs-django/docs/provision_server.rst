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

    wget 'https://nodejs.org/dist/v0.12.7/node-v0.12.7-linux-x86.tar.gz'
    tar xvzf node-v0.12.7-linux-x86.tar.gz

    # move the extracted tarball into a folder called 'node'
    mv node-v0.12.7-linux-x86 node

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
    ./manage.py makemigrations accounting contact location order person role session util
    ./manage.py migrate


Centos
------

Get Vagrant Centos

.. code-block::

    vagrant init chef/centos-7.0

    vagrant up

Set up Centos w/ Python

.. code-block::

    # Python3
    sudo yum -u update
    yum groupinstall "Development tools"
    wget http://www.python.org/ftp/python/2.7.6/Python-2.7.6.tar.xz
    tar -xvf Python-2.7.6.tar
    wget http://www.python.org/ftp/python/3.3.3/Python-3.3.3.tar.xz
    tar -xvf Python-3.3.3.tar
    cd Python-3.3.3    
    ./configure
    sudo make
    sudo make install

Virtualenv

`this SO answer <http://stackoverflow.com/a/15013895/1913888>`_

.. code-block::
    
    easy_install "virtualenv<1.11"
    mkdir ~/.virtualenvs/
    sudo virtualenv -p /usr/local/bin/python3 ~/.virtualenvs/bs_py3


Postgres

.. code-block::

    sudo yum install postgresql-server
    sudo yum install postgresql-devel

    sudo service postgresql initdb
    sudo service postgresql start

    sudo su postgres
    psql

    create role bsdev with password 'tango';
    alter role bsdev superuser login;
    create database ci owner bsdev;
    \q

    # change to peer auth to md5 
    sudo vi /var/lib/pgsql/data/pg_hba.conf


Node

`DO tutorial <https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-a-centos-7-server>`_

.. code-block::

    # also needed
    sudo npm install - g bower
    sudo npm install - g phantomjs

    # w/ Py3 SSL didn't work so did this:
    sudo yum install python-{requests,urllib3,six}
    sudo yum in stall openssl-devel



















