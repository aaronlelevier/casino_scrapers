#!/bin/bash -lx

export DJANGO_SETTINGS_MODULE='bigsky.settings.persistent'

cd bsrs-django/bigsky

wait
../venv/bin/python manage.py etl_category_type
../venv/bin/python manage.py etl_category_trade
../venv/bin/python manage.py etl_category_issue
wait
../venv/bin/python manage.py etl_location_region
../venv/bin/python manage.py etl_location_district
../venv/bin/python manage.py etl_location_store
wait
../venv/bin/python manage.py create_all_people
wait
../venv/bin/python manage.py create_tickets
