# start in the django/bigsky directory
rm -rf static
rm -rf templates/index.html
rm -rf ember/fonts
rm -rf ember/assets
find . -name '*.pyc' -delete
# now cd into the ember directory
ember build --env=production
# now cd into the django/bigsky directory
cp -r ../../bsrs-ember/dist/assets ember && cp -r ../../bsrs-ember/dist/fonts ember && cp -r ../../bsrs-ember/dist/index.html templates
# now cd back into the ember directory
rm -rf tmp dist
ember build
# now cd back into the django/bigsky directory
cd ember/assets
# this is the harder part to automate as the file names change
# ls to get the name of the js files so you can "rename" the non uglified assets
rm -rf bsrs-ember-30d0f3912321a21a39156a8d2bb454d2.js
cp ~/work/bigsky/bsrs-ember/dist/assets/bsrs-ember.js bsrs-ember-30d0f3912321a21a39156a8d2bb454d2.js
rm -rf vendor-739148125ad220eaf9dfd26cf75b044e.js
cp ~/work/bigsky/bsrs-ember/dist/assets/vendor.js vendor-739148125ad220eaf9dfd26cf75b044e.js
python manage.py collectstatic --noinput
python manage.py runserver
