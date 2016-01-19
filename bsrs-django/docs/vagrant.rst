Vagrant
-------

Startup

.. code-block::

	cd /to/vagrant/dir/
	vagrant up
	vagrant ssh

	# web user runs the app
	sudo su web

	# vagrant password = vagrant

	# got to web user home, and activate bash
	bash
	cd

	# get fresh copy of the repo
	rm -rf bsrs
	git clone git@github.com:bigskytech/bsrs.git


Stop

.. code-block::

	# from outside of vagrant (normal Bash)
	vagrant halt -f


Scott Note's for new vagrant setup

.. code-block::
    brew cask install vagrant

    # installs ubuntu 12.4
    mkdir vagrant #from root or wherever
    cd vagrant
    # https://atlas.hashicorp.com/boxes/search
    vagrant init hashicorp/precise32 #creates Vagrantfile
    OR
    vagrant init ubuntu/trusty64 #creates Vagrantfile
    vagrant up
    vagrant ssh

    # sudo apt-get installs
    sudo apt-get update
    sudo apt-get install postgresql
    sudo apt-get install python-psycopg2
    sudo apt-get install libpq-dev

    sudo apt-get install vim
    
    # configuration for sudo -u postgres psql
    startdb
    createdb foo
    psql foo
        CREATE ROLE bsdev WITH PASSWORD 'tango' CREATEDB SUPERUSER LOGIN;
        CREATE DATABASE ci OWNER bsdev;
        \q
    sudo -u postgres createuser -s vagrant     
    sudo -u postgres psql
        ALTER USER vagrant WITH PASSWORD 'vagrant'
    sudo service postgresql restart

    # modify last lines in following file and replace 'seed with 'md5
    sudo vim /etc/postgresql/9.1/main/pg_hba.cong
    # add new line with postgres and change to ci

    sudo apt-get install firefox
    sudo apt-get install x11-xserver-utils
    sudo apt-get install xvfb

    mkdir Downloads
    cd Downloads

    # node.js and symlink yourself
    wget [right click on link to url for node js linux tarball] #https://nodejs.org/en/download/
    tar xvzf node-v4.1.2-linux-x86.tar.gz
    # tar xvfJ is xz file
    rm -rf node-v4.1.2-linux-x86.tar.gz
    mv node-v4.1.2-linux-x86 node
    cd /usr/bin
    [sudo] ln -s ~/Downloads/node/bin/node /usr/bin/node
    [sudo] ln -s ~/Downloads/node/bin/npm /usr/bin/npm

    # python sourced (no symlink)
    cd Downloads

    sudo apt-get install build-essential libbz2-dev libncurses5-dev libreadline6-dev libsqlite3-dev libgdbm-dev liblzma-dev libssl-dev python3-setuptools
    sudo easy_install3 pip # if want pip installs

    wget [url for python verson] #sourced tarball https://www.python.org/downloads/release/python-343/ 
    tar -xvzf Python-3.4.3.tgz
    rm -rf Python-3.4.3.tgz
    cd Python-3.4.3

    sudo mkdir /opt/python
    sudo chown -R vagrant:vagrant /opt/python
    ./configure --prefix=/opt/python # check to see if have everything needed to build application
    make  # compiles source code
    make install # move to appropriate system directory
    .. cd /usr/bin
    .. ls | grep py3
    .. alias python=python3

    # nginx
    sudo apt-get install nginx 

    # setup github
    sudo apt-get install git
    cd 
    cd ..ssh
    ssh-keygen -t rsa -C "vagrant@snewcomer.com"
    ls -la .ssh
    cat .ssh/id_rsa.pub
    git clone git@github.com:bigskytech/bsrs.git

    # setup virtualenv
    sudo mkdir /opt/project_env
    sudo chown vagrant:vagrant /opt/project_env
    /opt/python/bin/pyvenv /opt/project_env
    source /opt/project_env/bin/activate
    pip install -r requirements_local.txt

    # check UTF8 encoding.  Rebuild template1 db
    psql template1 -c "UPDATE pg_database SET datallowconn = TRUE WHERE datname='template0'"
    psql template0 -c "UPDATE pg_database SET datistemplate = FALSE WHERE datname='template1'"
    dropdb template1
    psql
        create database template1 with owner=postgres encoding='UTF-8'
          lc_collate='en_US.utf8' lc_ctype='en_US.utf8' template template0;
    \q
    psql template0 -c "UPDATE pg_database SET datistemplate = TRUE WHERE datname='template1'"
    psql template1 -c "UPDATE pg_database SET datallowconn = FALSE WHERE datname='template0'"

    # ember side
    npm config set prefix /usr/local # ensure symlink binaries end up here.  Try npm config get prefix to see if set to /usr/local
    npm install -g bower
    npm install

    # headless browser
    Xvfb :1 &
    export DISPLAY=:1


    ./node_modules/ember-cli/bin/ember test -s
