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


Nginx
-----

.. code-block::

    sudo apt-get install nginx
    sudo service nginx start
    ifconfig eth0 | grep inet | awk (print $2)


Postgres
--------

**For Local Dev Machine**

.. code-block::

    pip install psycopg2
    
    # add pyscopg2 to settings.py INSTALLED_APPS

    # remove all old sqlite3 migrations
    rm -rf */migrations

    # run migrations
    ./manage.py makemigrations contact location order person role session util
    ./manage.py migrate




