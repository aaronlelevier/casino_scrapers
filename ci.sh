#!/bin/bash -lx

echo $(date -u) "BUILD STARTED!"

function npmInstall {
    npm install --no-optional
    NPM_INSTALL=$?
    echo $NPM_INSTALL
    if [ "$NPM_INSTALL" == 1 ]; then
      echo "npm install failed"
      exit $NPM_INSTALL
    fi
}

function emberTest {
    if [ "$(uname)" == "Darwin" ]; then
      ./node_modules/ember-cli/bin/ember test
    else
      xvfb-run ./node_modules/ember-cli/bin/ember test
    fi
    EMBER_TEST=$?
    if [ "$EMBER_TEST" == 1 ]; then
      echo "ember test failed"
      exit $EMBER_TEST
    fi
}

function pipInstall {
    echo "ENABLE SPECIFIC DJANGO SETTINGS FILE HERE B/C AFFECTS PIP INSTALL"
    export DJANGO_SETTINGS_MODULE='bigsky.settings.ci'
    rm -rf venv
    virtualenv venv
    source venv/bin/activate
    pip install -r requirements_ci.txt
    PIP_INSTALL=$?
    if [ "$PIP_INSTALL" == 1 ]; then
      echo "pip install failed"
      exit $PIP_INSTALL
    fi
}

function djangoTest {
    python manage.py test --settings=bigsky.settings.ci --liveserver=localhost:8001 --noinput --verbosity=3
    DJANGO_TEST=$?
    if [ "$DJANGO_TEST" == 1 ]; then
      echo "django test failed"
      exit $DJANGO_TEST
    fi
}

function productionEmberBuild {
    ./node_modules/ember-cli/bin/ember build --env=production
    EMBER_BUILD=$?
    if [ "$EMBER_BUILD" == 1 ]; then
      echo "production ember build failed"
      exit $EMBER_BUILD
    fi
}

function copyEmberAssetsToDjango {
    rm -rf -rf assets
    rm -rf -rf templates/index.html

    cp -r ../../bsrs-ember/dist/assets .
    COPY_EMBER_ASSETS=$?
    if [ "$COPY_EMBER_ASSETS" == 1 ]; then
      echo "copy of assets from ember to django failed"
      exit $COPY_EMBER_ASSETS
    fi

    cp -r ../../bsrs-ember/dist/index.html templates
    COPY_INDEX_HTML=$?
    if [ "$COPY_INDEX_HTML" == 1 ]; then
      echo "copy of index.html from ember to django failed"
      exit $COPY_INDEX_HTML
    fi
}

function dropAndCreateDB {

    DB_NAME="ci"
    export PGPASSWORD=tango

    dropdb $DB_NAME -U bsdev
    echo "$DB_NAME dropped"

    createdb $DB_NAME -U bsdev -O bsdev
    echo "$DB_NAME created"

    DROP_AND_CREATE_DB=$?
    if [ "$DROP_AND_CREATE_DB" == 1 ]; then
      echo "selenium test failed"
      exit $DROP_AND_CREATE_DB
    fi
}

function migrateData {
    ./manage.py migrate
    ./manage.py loaddata fixtures/jenkins.json
    ./manage.py loaddata fixtures/jenkins_custom.json

    MIGRATE_DATA=$?
    if [ "$MIGRATE_DATA" == 1 ]; then
      echo "selenium test failed"
      exit $MIGRATE_DATA
    fi
}


function runSeleniumTests {
    python run_selenium.py
    SELENIUM_TEST=$?
    if [ "$SELENIUM_TEST" == 1 ]; then
      echo "selenium test failed"
      exit $SELENIUM_TEST
    fi
}

cd bsrs-ember
npmInstall
emberTest

cd ../bsrs-django
pipInstall

cd bigsky
djangoTest

cd ../../bsrs-ember
productionEmberBuild

cd ../bsrs-django
cd bigsky

copyEmberAssetsToDjango

dropAndCreateDB

wait

migrateData

wait

runSeleniumTests

echo $(date -u) "BUILD SUCCESSFUL!"

exit 0
