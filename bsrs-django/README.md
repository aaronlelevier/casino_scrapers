# Bigsky Django Project README

Big Sky Retail Services - Django code repository

## Setup

Try to upgrade to the latest verson of `pip`, if `pip` is not available 
get the python install file [here](https://bootstrap.pypa.io/get-pip.py) and install it.

```
easy_install -U pip
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

Once the `virtualenv` is activated, `cd` in to the project directory, and 
install the python dependencies from the `requirements.txt` file.

```
pip install -r requirements.txt
```

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

### Suggested next steps

- To create a test directory for each app to break up the tests logically
- To discuss needend DRF tests for the Person model to support the current 
progress of the Ember frontend
