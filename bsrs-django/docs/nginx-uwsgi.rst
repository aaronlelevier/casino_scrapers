Python 3.4
==========

.. code-block::

    # make a directory to store the tarball in

    # INSTALL PYTHON 3.4
    wget http://python.org/ftp/python/3.4.1/Python-3.4.1.tar.xz
    tar xvf Python-3.4.1.tar.xz
    cd Python-3.4.1
    sudo ./configure --prefix=/usr/local --enable-shared LDFLAGS="-Wl,-rpath /usr/local/lib"
    sudo make
    sudo make altinstall
    # This will install pip3.4 already


PostgreSQL
==========

.. code-block::

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


Virtualenv
==========

.. code-block::

    # creat Python3 virtualenv
    virtualenv -p /usr/local/bin/python3.4 ~/.virtualenvs/bs_py34

    # activate virtualenv
    source ~/.virtualenvs/bs_py34/bin/activate

    # psycopg2
    pip3 install psycopg2

    # pip install remainder
    cd ../bsrs-django
    pip3 install -r requirements.txt



Nginx
=====

.. code-block::

    include /etc/nginx/conf.d/*.conf;

    sudo service nginx restart
    sudo service nginx status


Static Assets
=============

.. code-block::

    sudo ~/.virtualenvs/bs_py34/bin/python manage.py collectstatic --noinput
    # or (w/ virtualenv activated)
    sudo python manage.py collectstatic --noinput 


uWSGI
=====

Setting up uWSGI
----------------
`Followed this blog <http://www.robberphex.com/2014/03/335>`_

The main steps are:

0. Make sure that uWSGI is not installed globally

1. Compile uWSGI from source:

.. code-block::

    wget http://projects.unbit.it/downloads/uwsgi-2.0.3.tar.gz
    tar -xvf uwsgi-2.0.3.tar.gz
    cd uwsgi-2.0.3

2. Activate virtualenv & build uWSGI

.. code-block::

    python uwsgiconfig.py --build

3. Then use the *path/to/uwsgi/executable* to run uWSGI:

.. code-block::

    /usr/local/lib/uwsgi/uwsgi --ini uwsgi.ini

    # Note: in order to run as daemon, w/i 'uwsgi.ini' file add:
    daemonize = /path/to/logfile.log


Tests with uWSGI
----------------

.. code-block::

    # test uwsgi works
    ~/misc/uwsgi-2.0.3/uwsgi --http :8003 --wsgi-file test.py

    # test 'runserver'
    # activate virtualenv
    python manage.py runserver 0.0.0.0:8003

    # test project '.wsgi' file
    ~/misc/uwsgi-2.0.3/uwsgi --http :8003 --wsgi-file bigsky.wsgi

    # test socket
    ~/misc/uwsgi-2.0.3/uwsgi --socket bigsky.socket --wsgi-file bigsky.wsgi

    # test 'ini'
    sudo ~/misc/uwsgi-2.0.3/uwsgi --ini uwsgi.ini

    # run compiled "uwsgi"
    ~/misc/uwsgi-2.0.3/uwsgi --http :8003 --wsgi-file bigsky.wsgi
