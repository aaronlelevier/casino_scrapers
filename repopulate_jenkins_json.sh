#!/bin/bash -lx

cd bsrs-django/bigsky
wait
dropdb ci
wait
createdb ci
wait
./manage.py makemigrations accounting category contact generic location order person session \
third_party ticket translation utils work_request
wait
./manage.py migrate
wait
./manage.py loaddata fixtures/location.State.json
./manage.py loaddata fixtures/translation.json
./manage.py loaddata fixtures/accounting.Currency.json
./manage.py loaddata fixtures/contact.PhoneNumberType.json
./manage.py loaddata fixtures/contact.AddressType.json
./manage.py loaddata fixtures/category.json
./manage.py loaddata fixtures/third_party.json
./manage.py loaddata fixtures/auth.json
./manage.py loaddata fixtures/location.json


wait
./manage.py create_all_people
wait
./manage.py dumpdata person --indent=2 > fixtures/person.json
wait
./manage.py create_tickets
wait
./manage.py dumpdata ticket --indent=2 > fixtures/ticket.json
