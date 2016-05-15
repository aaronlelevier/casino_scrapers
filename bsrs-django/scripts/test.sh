#!/bin/bash

# activate virtualenv
. /appenv/bin/activate

pip install -r requirements_ci.txt
cd bigsky
# ./manage.py collectstatic --noinput
# ./manage.py migrate

exec $@

