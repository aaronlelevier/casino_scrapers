#!/bin/bash -lx

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

rm -rf tests.db
rvm 2.2.1
rvm gemset create bigsky
rvm gemset use bigsky
bundle install
if [ "$?" == 1 ]; then
  echo "bundle install failed"
  exit $?
fi

python run_selenium.py
if [ "$?" == 1 ]; then
  echo "selenium test failed"
  exit $?
fi

echo "BUILD FINISHED!"
exit $?
