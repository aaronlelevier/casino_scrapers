#!/bin/bash -lx

cd bsrs-ember
rm -rf tmp dist
wait
./node_modules/ember-cli/bin/ember build --env=production
wait
cd ../bsrs-django/bigsky
rm -rf ember/fonts && rm -rf ember/assets && rm -rf templates/index.html
wait
cp -r ../../bsrs-ember/dist/assets ember && cp -r ../../bsrs-ember/dist/fonts ember && cp -r ../../bsrs-ember/dist/index.html templates
wait
dropdb ci
wait
createdb ci
wait
python manage.py migrate && python manage.py loaddata fixtures/states.json
wait
./manage.py loaddata fixtures/translations.json
./manage.py loaddata fixtures/currency.json
./manage.py loaddata fixtures/category.json
./manage.py loaddata fixtures/third_party.json
wait
./manage.py create_all_people
wait
rm -rf fixtures/jenkins.json
wait
./manage.py dumpdata --indent=2 > fixtures/jenkins.json
wait
python manage.py loaddata fixtures/jenkins.json && python manage.py loaddata fixtures/jenkins_custom.json
wait
./manage.py create_tickets
wait
rm -rf fixtures/tickets.json
wait
./manage.py dumpdata ticket.Ticket --indent=2 > fixtures/tickets.json
wait
python manage.py loaddata fixtures/tickets.json
wait
python manage.py collectstatic --noinput
