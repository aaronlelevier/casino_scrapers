Postgres
========

General Setup
-------------

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


Django config and commands
--------------------------

.. code-block::

    pip instal psycopg2

    # pre-requisite for "psycopg2" or else will get this error:
    # * Error: pg_config executable not found. *
    sudo yum install postgresql postgresql-devel

    # create separate DB for persistent deploy
    createdb persistent -U bsdev -O bsdev

    # enable ``Django`` settings/persistent.py
    export DJANGO_SETTINGS_MODULE='bigsky.settings.persistent'

    # run initial migrations (no data loaded at this point)
    ./manage.py migrate

    # initial data (only required for initial setup)
    ./manage.py loaddata fixtures/jenkins.json
    ./manage.py loaddata fixtures/jenkins_custom.json


Upgrading Postgres 9.3 to 9.4
-----------------------------

Dump all current databases from the Postgres

.. code-block::

    sudo ln -s /usr/pgsql-9.3/bin/pg_dumpall /usr/bin/pg_dumpall --force
    sudo pg_dumpall ~/bsdev/outfile.sql

Download and install new Postgres version

.. code-block::

    sudo rpm -Uvh http://yum.postgresql.org/9.4/redhat/rhel-7-x86_64/pgdg-centos94-9.4-1.noarch.rpm
    sudo yum update
    sudo yum install postgresql94-server postgresql94-contrib postgresql94-devel
    sudo /usr/pgsql-9.4/bin/postgresql94-setup initdb
    sudo systemctl enable postgresql-9.4
    sudo service postgresql-9.4 start

At this point, the new version of Postgres is installed and the data needs to be uploaded.

.. code-block::

    sudo vi /var/lib/pgsql/9.4/data/pg_hba.conf
    # change "peer" or "ident" to "md5"

    su postgres
    psql
    CREATE ROLE bsdev WITH PASSWORD 'tango' CREATEDB SUPERUSER LOGIN;
    \q

    sudo /usr/pgsql-9.4/bin/psql -U bsdev -d postgres -f ~/bsdev/outfile.sql

