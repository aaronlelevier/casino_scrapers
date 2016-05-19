#!/bin/bash

# activate virtualenv
. /appenv/bin/activate

# setup.py puts src in /build so have full setup
pip download -d /build -r requirements_ci.txt --no-input 

pip install --no-index -f /build -r requirements_ci.txt
cd bigsky
# ./bigsky/manage.py collectstatic --noinput
# ./bigsky/manage.py migrate

exec $@
