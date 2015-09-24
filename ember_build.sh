cd bsrs-ember
./node_modules/ember-cli/bin/ember build --env=production
wait
rm -rf -rf assets
rm -rf -rf templates/index.html
wait
rm -rf ../bsrs-django/bigsky/ember/*
wait
cp -r dist/assets ../bsrs-django/bigsky/ember/assets
cp -r dist/fonts ../bsrs-django/bigsky/ember/fonts
cp -r dist/index.html ../bsrs-django/bigsky/templates

cd ../bsrs-django/bigsky/
rm -rf static/*
./manage.py collectstatic --noinput
