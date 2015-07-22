#!/bin/bash -lx

echo "BUILD STARTED!"

function npmInstall {
    npm install
    NPM_INSTALL=$?
    echo $NPM_INSTALL
    if [ "$NPM_INSTALL" == 1 ]; then
      echo "npm install failed"
      exit $NPM_INSTALL
    fi
}

function emberTest {
    ./node_modules/ember-cli/bin/ember test
    EMBER_TEST=$?
    if [ "$EMBER_TEST" == 1 ]; then
      echo "ember test failed"
      exit $EMBER_TEST
    fi
}

function pipInstall {
    rm -rf venv
    virtualenv venv
    source venv/bin/activate
    pip install -r requirements.txt
    PIP_INSTALL=$?
    if [ "$PIP_INSTALL" == 1 ]; then
      echo "pip install failed"
      exit $PIP_INSTALL
    fi
}

function djangoTest {
    python manage.py test --settings=bigsky.settings.ci --liveserver=localhost:8001
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
    rm -rf tests.db

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

runSeleniumTests

echo "BUILD SUCCESSFUL!"
exit 0
