./node_modules/ember-cli/bin/ember build --env=production
wait
rm -rf -rf assets
rm -rf -rf templates/index.html
wait
cp -r ../../bsrs-ember/dist/assets .
cp -r ../../bsrs-ember/dist/index.html templates