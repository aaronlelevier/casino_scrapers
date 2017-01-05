#!/bin/bash -lx

# Start at root of project
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR
cd ../

export DJANGO_SETTINGS_MODULE='bigsky.settings.persistent'

cd bsrs-django/bigsky

wait
../venv/bin/python manage.py create_tenant
wait
../venv/bin/python manage.py etl_category_type
../venv/bin/python manage.py etl_category_trade
../venv/bin/python manage.py etl_category_issue
wait
../venv/bin/python manage.py etl_location_region
../venv/bin/python manage.py etl_location_district
../venv/bin/python manage.py etl_location_store
wait
../venv/bin/python manage.py etl_role
wait
../venv/bin/python manage.py etl_person
wait
../venv/bin/python manage.py etl_ticket
