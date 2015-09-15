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

Uwsgi
=====

.. code-block::

    # check that uWSGI is installed globally
    uwsgi --http :8003 --wsgi-file test.py

    # w/ django - simple
    uwsgi --http :8003 --home /home/bsdev/.virtualenvs/bs_py34 --chdir /www/django/releases/persistent/bsrs/python3/ --wsgi-file bigsky.wsgi --no-site

    uwsgi --http :8003 --home /home/bsdev/.virtualenvs/bs_py34 --chdir /www/django/releases/persistent/bsrs/python3/ --wsgi-file bigsky.wsgi --no-site
