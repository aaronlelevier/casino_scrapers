#!/bin/bash -lx

echo $(date -u) "SELENIUM BUILD STARTED!"

# Start at root of project
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR
cd ../

function npmInstall {
    npm cache clean
    bower cache clean
    npm install
    NPM_INSTALL=$?
    echo $NPM_INSTALL
    if [ "$NPM_INSTALL" == 1 ]; then
      echo "npm install failed"
      exit $NPM_INSTALL
    fi
}

function pipInstall {
    echo "ENABLE SPECIFIC DJANGO SETTINGS FILE HERE B/C AFFECTS PIP INSTALL"
    export DJANGO_SETTINGS_MODULE='bigsky.settings.ci'
    rm -rf venv*
    virtualenv -p /usr/local/bin/python3.4 venv
    source venv/bin/activate
    pip install -r requirements_ci.txt
    PIP_INSTALL=$?
    if [ "$PIP_INSTALL" == 1 ]; then
      echo "pip install failed"
      exit $PIP_INSTALL
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
    rm -rf ember/*
    rm -rf static/*
    rm -rf templates/index.html
    wait
    cp -r ../../bsrs-ember/dist/assets ember/assets
    cp -r ../../bsrs-ember/dist/fonts ember/fonts
    cp -r ../../bsrs-ember/dist/index.html templates
    COPY_EMBER_ASSETS=$?
    if [ "$COPY_EMBER_ASSETS" == 1 ]; then
      echo "copy of assets from ember to django failed"
      exit $COPY_EMBER_ASSETS
    fi

    wait
    ./manage.py collectstatic --noinput
    DJANGO_COLLECT_STATIC=$?
    if [ "$DJANGO_COLLECT_STATIC" == 1 ]; then
      echo "django collectstatic failed"
      exit $DJANGO_COLLECT_STATIC
    fi
}

function dropAndCreateDB {

    DB_NAME="ci"
    export PGPASSWORD=tango

    wait
    dropdb $DB_NAME -U bsdev
    echo "$DB_NAME dropped"

    wait
    createdb $DB_NAME -U bsdev -O bsdev
    echo "$DB_NAME created"

    DROP_AND_CREATE_DB=$?
    if [ "$DROP_AND_CREATE_DB" == 1 ]; then
      echo "createdb failed"
      exit $DROP_AND_CREATE_DB
    fi
}

function migrateData {
    ./manage.py migrate

    MIGRATE_DATA=$?
    if [ "$MIGRATE_DATA" == 1 ]; then
      echo "selenium test failed"
      exit $MIGRATE_DATA
    fi
}

function loadFixtures {
    cd ../../
    DIR="${BASH_SOURCE%/*}"
    if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi
    . "$DIR/_load_fixtures.sh"

    LOAD_FIXTURES=$?
    if [ "$LOAD_FIXTURES" == 1 ]; then
      echo "load fixtures failed"
      exit $LOAD_FIXTURES
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

DB_NAME='ci'
wait
psql -U bsdev -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity \
WHERE pg_stat_activity.datname = '${DB_NAME}' AND pid <> pg_backend_pid();"
wait

cd bsrs-ember
echo $(firefox -v)

echo $(date -u) "NPM INSTALL"
npmInstall

cd ../bsrs-django

echo $(date -u) "PIP INSTALL"
pipInstall

cd ../bsrs-ember

echo $(date -u) "BUILD EMBER"
productionEmberBuild

cd ../bsrs-django/bigsky

wait
echo $(date -u) "COLLECT STATIC ASSETS"
copyEmberAssetsToDjango

wait
echo $(date -u) "DROP AND CREATE DATABASE"
dropAndCreateDB

wait
echo $(date -u) "DJANGO MIGRATE DATABASE"
migrateData

wait
echo $(date -u) "LOAD FIXTURES"
loadFixtures

wait
echo $(date -u) "SELENIUM TESTS"
runSeleniumTests

echo $(date -u) "BUILD SUCCESSFUL!"

exit 0
