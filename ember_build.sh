cd bsrs-ember
./node_modules/ember-cli/bin/ember build --env=production

wait
cp -r dist/assets ../bsrs-django/bigsky/ember/assets
cp -r dist/fonts ../bsrs-django/bigsky/ember/fonts
cp -r dist/index.html ../bsrs-django/bigsky/templates

cd ../bsrs-django/bigsky/
./manage.py collectstatic --noinput
