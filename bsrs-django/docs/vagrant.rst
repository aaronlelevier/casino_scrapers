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
    
    # Other 
    sudo apt-get install python3-dev
    sudo apt-get install libevent-dev
    sudo apt-get install python-dev libjpeg-dev libfreetype6-dev zlib1g-dev
    sudo apt-get install postgresql-9.4-postgis-2.0

    # free up memory
        touch Customfile #at folder level of Vagrantfile
            config.vm.provider :virtualbox do |v|
              v.customize ["modifyvm", :id, "--memory", 2048]
            end
        free -m #see physical vs swap
        sudo swapon -s
        cat /proc/meminfo
        sudo fallocate -l 2G /swapfile
        sudo mkswap /swapfile
        sudo swapon -s
        ls -lh /swapfile
        sudo chmod 600 /swapfile
        swap file
        sudo nano /etc/fstab




.. code-block::
    # CENTOS setup
    sudo yum -y update
    yum groupinstall "Development tools"
    sudo yum install wget
    # Python
    wget https://www.python.org/ftp/python/3.4.3/Python-3.4.3.tgz
    tar -xvf Py..
    cd Pytho..
    ./configure
    sudo make
    sudo make altinstall
        # do this if fails
        sudo yum install python-{requests,urllib3,six}
        sudo yum install openssl-devel
        sudo yum install python-devel
    # headless
    sudo yum install vim 
    sudo yum install firefox 
    sudo yum install xorg-X11-server-Xvfb
    # Postgresql
    # https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-centos-7
    rpm -Uvh http://yum.postgresql.org/9.4/redhat/rhel-7-x86_64/pgdg-centos94-9.4-1.noarch.rpm
    sudo yum install postgresql94-server postgresql94-contrib
    sudo /usr/pgsql-9.4/bin/postgresql94-setup initdb
    sudo systemctl enable postgresql-9.4
    sudo systemctl start postgresql-9.4
    sudo -i -u postgres (or sudo su postgres)
        CREATE ROLE bsdev WITH PASSWORD 'tango' CREATEDB SUPERUSER LOGIN;
        CREATE DATABASE ci OWNER bsdev;
        CREATE USER vagrant WITH PASSWORD 'vagrant';
        GRANT ALL PRIVILEGES ON DATABASE ci to vagrant;
        \q
    ctl d (logout of postgres and don't spawn new user instances)
    sudo vim /var/lib/pgsql/data/pg_hba.conf
        #change ident to md5
        sudo systemctl enable postgresql-9.4
        sudo systemctl start postgresql-9.4
    or 
        sudo /usr/pgsql-9.4/bin/postgresql94-setup initdb
        sudo systemctl enable postgresql-9.4
        sudo systemctl start postgresql-9.4
            # if asks to delete data/ then will lose role and users setup previously
            # need to set chmod 700 on data directory, not 777
            # sudo passwd postgres to change password if prompted ## not working
            # sudo systemctl status postgresql-9.4.service for logs
    # Other notes
        psql foo
            ALTER DATABASE ci OWNER TO vagrant; 
            ALTER USER vagrant superuser createdb replication;
        ctrl d (logout postgres user instance)
    # Node
    wget <https://github.com/creationix/nvm>
    source ~/.bash_profile
    nvm install v5.0.0 (or whatever version you need)
    sudo yum -y update
    # github
    sudo yum install git
    eval "$(ssh-agent -s)"
    sudo pip install virtualenv
    sudo pip install --upgrade virtualenv
    which python3
    virtualenv -p /usr/local/bin/python3.4 venv
    source venv/bin/activate
    sudo yum install postgresql-libs
    sudo yum install postgresql-devel
    sudo yum install libevent-devel
    sudo yum install libjpeg-devel zlib-devel
    # pip install
    wget https://bootstrap.pypa.io/ez_setup.py -O - | sudo python
    unzip setup_tools...
    cd setup_tools
    ## sudo chmod 777 /usr/local/bin/
    python3.4 setup.py install
    easy_install pip
    pip install virtualenv
    # cd project django level
    virtualenv -p /usr/local/bin/3.4 venv
    source venv/bin/activate

    # free up memory
        swap file

    

    

