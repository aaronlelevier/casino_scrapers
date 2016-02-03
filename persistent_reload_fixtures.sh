#!/bin/bash -lx

export DJANGO_SETTINGS_MODULE='bigsky.settings.persistent'

cd bsrs-django/bigsky

dropdb persistent
wait
createdb persistent
wait
../venv/bin/python manage.py migrate
wait
../venv/bin/python manage.py loaddata fixtures/location.State.json
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
./manage.py dumpdata --indent=2 > fixtures/persistent/persistent.json
