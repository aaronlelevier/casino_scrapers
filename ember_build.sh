cd bsrs-ember
./node_modules/ember-cli/bin/ember build --env=production
wait
rm -rf -rf assets
rm -rf -rf templates/index.html
wait
cp -r dist/assets ../bsrs-django/bigsky
cp -r dist/index.html ../bsrs-django/bigsky/templates