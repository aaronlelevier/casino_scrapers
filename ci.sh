#!/bin/bash -lx

echo "BUILD STARTED!"

cd bsrs-ember
npm install
if [ "$?" == 1 ]; then
  echo "npm install failed"
  exit $?
fi
./node_modules/ember-cli/bin/ember test
if [ "$?" == 1 ]; then
  echo "ember test failed"
  exit $?
fi

cd ../bsrs-django
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
if [ "$?" == 1 ]; then
  echo "pip install failed"
  exit $?
fi

cd bigsky
python manage.py test --settings=bigsky.settings.ci
if [ "$?" == 1 ]; then
  echo "django test failed"
  exit $?
fi

cd ../../bsrs-ember
./node_modules/ember-cli/bin/ember build --env=production
if [ "$?" == 1 ]; then
  echo "production ember build failed"
  exit $?
fi

cd ../bsrs-django
cd bigsky
rm -rf -rf assets && rm -rf -rf templates/index.html && rm -rf tests.db
cp -r ../../bsrs-ember/dist/assets .
cp -r ../../bsrs-ember/dist/index.html templates

python run_selenium.py
if [ "$?" == 1 ]; then
  echo "selenium test failed"
  exit $?
fi

exit $?
