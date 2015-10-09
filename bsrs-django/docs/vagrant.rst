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
    sudo apt-get install virtualbox
    sudo apt-get install vagrant

    # installs ubuntu 12.4
    vagrant init hashicorp/precise32
    vagrant up

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
    sudo -u postgres psql -c 
        ALTER USER vagrant WITH PASSWORD 'vagrant'
    sudo service postgresql restart

    # modify last lines in following file and replace 'seed with 'md5
    sudo vim /etc/postgresql/9.1/main/pg_hba.cong

    sudo apt-get install firefox
    sudo apt-get install x11-xserver-utils
    sudo apt-get install xvfb
    mkdir Downloads
    cd Downloads

    # node.js and symlink yourself
    wget [right click on link to url for node js linux tarball] #https://nodejs.org/en/download/
    tar xvzf node-v4.1.2-linux-x86.tar.gz
    rm -rf node-v4.1.2-linux-x86.tar.gz
    mv node-v4.1.2-linux-x86 node
    cd /usr/bin
    [sudo] ln -s ~/Downloads/node/bin/node /usr/bin/node
    [sudo] ln -s ~/Downloads/node/bin/npm /usr/bin/npm

    # python sourced (no symlink)
    cd Downloads
    wget [url for python verson] #sourced tarball https://www.python.org/downloads/release/python-343/ 
    tar -xvzf Python-3.4.3.tgz
    rm -rf Python-3.4.3.tgz
    cd Python-3.4.3.tgz
    [sudo] ./configure && sudoe make && sudo make install
    [sudo] pip3 install --upgrade pip setuptools
    cd /usr/bin
    ls | grep py3
    alias python=python3
    cd 

    # setup github
    cd ..ssh
    ssh-keygen -t rsa -C "vagrant@snewcomer.com"
    ls -la .ssh
    cat .ssh/id_rsa.pub
    sudo apt-get install git
    git clone git@github.com:bigskytech/bsrs.git
    npm install -g bower
    ./node_modules/bower/bin/bower install

    # headless browser
    Xvfb :1 &
    export DISPLAY=:1

    # setup virtualenv
    sudo apt-get remove python-virtualenv
    sudo pip3 install virtualenv --upgrade




    ./node_modules/ember-cli/bin/ember test -s
