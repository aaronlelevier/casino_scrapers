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


PostgreSQL / Virtualenv
=======================

.. code-block::

    # pre-requisite for "psycopg2" or else will get this error:
    # * Error: pg_config executable not found. *
    sudo yum install postgresql postgresql-devel

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

    # test.py
    uwsgi --http :8003 --wsgi-file test.py

    # w/ django - simple
    uwsgi --http :8003 --chdir /www/django/releases/persistent/bsrs/python3/ --wsgi-file bigsky.wsgi --no-site