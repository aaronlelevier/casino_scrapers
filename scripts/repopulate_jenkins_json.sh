#!/bin/bash -lx

# Start at root of project
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR
cd ../

cd bsrs-django/bigsky
wait
dropdb ci
wait
createdb ci
wait
./manage.py migrate
wait
./manage.py loaddata fixtures/contact.Country.json
./manage.py loaddata fixtures/contact.State.json
./manage.py loaddata fixtures/translation.json
./manage.py loaddata fixtures/accounting.Currency.json
./manage.py loaddata fixtures/contact.EmailType.json
./manage.py loaddata fixtures/contact.PhoneNumberType.json
./manage.py loaddata fixtures/contact.AddressType.json
./manage.py loaddata fixtures/category.json
./manage.py loaddata fixtures/third_party.json
./manage.py loaddata fixtures/auth.json
./manage.py loaddata fixtures/location.json
./manage.py loaddata fixtures/dtd.json

wait
./manage.py create_all_people
wait
./manage.py dumpdata person --indent=2 > fixtures/person.json
./manage.py dumpdata tenant --indent=2 > fixtures/tenant.json

wait
./manage.py create_tickets
wait
./manage.py dumpdata ticket --indent=2 > fixtures/ticket.json
./manage.py dumpdata routing --indent=2 > fixtures/routing.json
