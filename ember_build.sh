cd bsrs-ember
./node_modules/ember-cli/bin/ember build --env=production

wait
cd ../bsrs-django/bigsky/

rm -rf ember/*
rm -rf static/*
rm -rf templates/index.html

cp -r ../../bsrs-ember/dist/assets ember/assets
cp -r ../../bsrs-ember/dist/fonts ember/fonts
cp -r ../../bsrs-ember/dist/index.html templates

./manage.py collectstatic --noinput
