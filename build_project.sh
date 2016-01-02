#!/bin/bash -lx

echo "BUILD EMBER"

cd bsrs-ember

rm -rf tmp dist
wait
./node_modules/ember-cli/bin/ember build --env=production

cd ../bsrs-django/bigsky

wait
rm -rf ember/*
rm -rf static/*
rm -rf templates/index.html
wait
cp -r ../../bsrs-ember/dist/assets ember
cp -r ../../bsrs-ember/dist/fonts ember
cp -r ../../bsrs-ember/dist/index.html templates
wait
./manage.py collectstatic --noinput

echo "MIGRATE DATABASE"
wait
dropdb ci
wait
createdb ci
wait
./manage.py migrate

echo "LOAD FIXTURE DATA"

wait
./manage.py loaddata fixtures/location.State.json
./manage.py loaddata fixtures/translation.json
./manage.py loaddata fixtures/accounting.Currency.json
./manage.py loaddata fixtures/contact.EmailType.json
./manage.py loaddata fixtures/contact.PhoneNumberType.json
./manage.py loaddata fixtures/contact.AddressType.json
./manage.py loaddata fixtures/category.json
./manage.py loaddata fixtures/third_party.json
./manage.py loaddata fixtures/auth.json
./manage.py loaddata fixtures/location.json
./manage.py loaddata fixtures/person.json
./manage.py loaddata fixtures/ticket.json
