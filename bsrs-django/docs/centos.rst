Centos
======

Get Vagrant Centos
------------------

.. code-block::

    vagrant init chef/centos-7.0

    vagrant up

Set up Centos w/ Python
-----------------------

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

Processes
---------

.. code-block::

    # kill process on port #
    sudo fuser -k 8003/tcp

Virtualenv
----------

`this SO answer <http://stackoverflow.com/a/15013895/1913888>`_

.. code-block::
    
    easy_install "virtualenv<1.11"
    mkdir ~/.virtualenvs/
    sudo virtualenv -p /usr/local/bin/python3 ~/.virtualenvs/bs_py3


Postgres
--------

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
----

`DO tutorial <https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-a-centos-7-server>`_

.. code-block::

    # also needed
    sudo npm install - g bower
    sudo npm install - g phantomjs

    # w/ Py3 SSL didn't work so did this:
    sudo yum install python-{requests,urllib3,six}
    sudo yum in stall openssl-devel

