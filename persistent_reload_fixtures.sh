#!/bin/bash -lx

export DJANGO_SETTINGS_MODULE='bigsky.settings.persistent'

cd bsrs-django/bigsky

DB_NAME='persistent'
export PGPASSWORD=tango
wait
psql -U bsdev -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity \
WHERE pg_stat_activity.datname = '${DB_NAME}' AND pid <> pg_backend_pid();"
wait
dropdb $DB_NAME -U bsdev
wait
createdb $DB_NAME -U bsdev -O bsdev
wait
../venv/bin/python manage.py migrate
wait
../venv/bin/python manage.py loaddata fixtures/contact.Country.json
../venv/bin/python manage.py loaddata fixtures/contact.State.json
../venv/bin/python manage.py loaddata fixtures/translation.json
../venv/bin/python manage.py loaddata fixtures/accounting.Currency.json
../venv/bin/python manage.py loaddata fixtures/contact.EmailType.json
../venv/bin/python manage.py loaddata fixtures/contact.PhoneNumberType.json
../venv/bin/python manage.py loaddata fixtures/contact.AddressType.json
../venv/bin/python manage.py loaddata fixtures/category.json
../venv/bin/python manage.py loaddata fixtures/third_party.json
../venv/bin/python manage.py loaddata fixtures/auth.json
wait
../venv/bin/python manage.py loaddata utils_transform/tlocation/fixtures/location_levels.json
wait
../venv/bin/python manage.py etl_location_region
../venv/bin/python manage.py etl_location_district
../venv/bin/python manage.py etl_location_store
wait
../venv/bin/python manage.py create_all_people
wait
../venv/bin/python manage.py create_tickets
