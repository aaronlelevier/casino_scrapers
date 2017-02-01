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
# leaf node
./manage.py loaddata fixtures/contact.Country.json
./manage.py loaddata fixtures/contact.State.json
# contact types
./manage.py loaddata fixtures/contact.EmailType.json
./manage.py loaddata fixtures/contact.PhoneNumberType.json
./manage.py loaddata fixtures/contact.AddressType.json
# contacts
./manage.py loaddata fixtures/contact.Email.json
./manage.py loaddata fixtures/contact.PhoneNumber.json
./manage.py loaddata fixtures/contact.Address.json
# i18n
./manage.py loaddata fixtures/translation.json
# tenant requires currency and dtd-start
./manage.py loaddata fixtures/accounting.Currency.json
./manage.py loaddata fixtures/dtd.json
./manage.py loaddata fixtures/tenant.json
# category and location need a tenant
./manage.py create_categories
./manage.py dumpdata category --indent=2 > fixtures/category.json
# provider per category
./manage.py create_provider
./manage.py dumpdata provider --indent=2 > fixtures/provider.json
# location
./manage.py create_locations
./manage.py dumpdata location --indent=2 > fixtures/location.json

wait
./manage.py create_all_people
wait
./manage.py dumpdata person --indent=2 > fixtures/person.json
./manage.py dumpdata generic --indent=2 > fixtures/generic.json
./manage.py dumpdata tenant --indent=2 > fixtures/tenant.json

# create Subscriber / Locations in SC, and dump to fixtures
wait
./manage.py create_sc_tenant
./manage.py create_sc_locations
wait
./manage.py loaddata fixtures/tenant.json
./manage.py dumpdata location --indent=2 > fixtures/location.json

wait
./manage.py create_tickets
wait
# work_order requires a ticket
./manage.py create_work_order
wait
./manage.py dumpdata ticket --indent=2 > fixtures/ticket.json
wait
./manage.py dumpdata work_order --indent=2 > fixtures/work_order.json

wait
./manage.py create_automations
wait
./manage.py dumpdata automation --indent=2 > fixtures/automation.json

wait
./manage.py dumpdata auth --indent=2 > fixtures/auth.json
