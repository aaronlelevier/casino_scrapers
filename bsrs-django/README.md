# Bigsky Django Project README

Big Sky Retail Services - Django code repository

## Setup Python Environment

#### pip

Try to upgrade to the latest verson of `pip`, if `pip` is not available 
get the python install file [here](https://bootstrap.pypa.io/get-pip.py) and install it.

```
easy_install -U pip==7.1.0
```

#### virtualenv

Install globally

```
pip install virtualenv
```

Create a directory at the root directory to hold `virtualenvs` and 
create a `virtualenv` there for this project

```
mkdir ~/.virtualenvs
cd ~/.virtualenvs
virtualenv bs # bs is the name of the virtualenv
```

[virtualenv commands](https://virtualenv.pypa.io/en/latest/userguide.html#usage)

```
# activate
source ~/.virtualenvs/bs/bin/activate

# deactivate
deactivate
```

#### Start new app


This will create the boiler plate app for DRF with a separate test directory.

```
./manage.py startappdrf <app_name>
```

#### Python 3

[Download Python 3.4.3](https://www.python.org/downloads/release/python-343/)
OR
brew switch [formula] [version]

Create a virtualenv with Python 3

`virtualenv -p /usr/local/bin/python3.4 ~/.virtualenvs/py3`

#### requirements.txt style pip install

Once the `virtualenv` is activated, `cd` in to the project directory, and 
install the python dependencies from the `requirements.txt` file.

```
pip install -r requirements_local.txt
```

#### psycopg2

note: to install psycopg2 you need to have the postgres bin directory on the path before running pip install.

e.g. export PATH=$PATH:/opt/local/lib/postgresql93/bin

## Style Guide

### REST API

All `API` endpoints start with `/api/`

Each `API` endpoint is then followed by the app name, model name, method name, 
and so on in a plain vanilla naming standard. For example:

```
# All Person models in the Person App
/api/person/person/

# Retrieve/Update a single Person within the Person App
/api/person/person/1/
```

### Variable Names

Are named as `name_as_lowercase_with_underscores` as opposed to `camelCase`

### Postgres

#### Installation

```
# create Postgres DB on dev machine named "local"
# in "psql" the commands starting from command line are:
psql 	# enter psql
create database local;
\q   	# exit psql

pip install psycopg2

# remove all old sqlite3 migrations (if present)
rm -rf */migrations

# run migrations
./manage.py makemigrations contact location order person role session util
./manage.py migrate
```

#### CI Postgres Database Setup

Login to `psql` then run commands

```
psql
CREATE ROLE bsdev WITH PASSWORD 'tango' CREATEDB SUPERUSER LOGIN;
CREATE DATABASE ci OWNER bsdev;
\q
```

#### Misc. Commands Using `psql`

How to drop database and role.  (Must drop database first if owned by the role)

```
DROP DATABASE ci;
DROP ROLE bsdev;
```

List of Postgres Roles

`\du`

List of Postgres Databases

`\l`
