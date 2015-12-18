#!/bin/bash -lx

echo $(date -u) "DJANGO BUILD STARTED!"

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

function djangoTest {
    python manage.py test --settings=bigsky.settings.ci --liveserver=localhost:8001 --noinput --verbosity=3
    DJANGO_TEST=$?
    if [ "$DJANGO_TEST" == 1 ]; then
      echo "django tests failed"
      exit $DJANGO_TEST
    fi
}

cd bsrs-django

echo $(date -u) "PIP INSTALL"
pipInstall

cd bigsky

echo $(date -u) "DJANGO TESTS"
djangoTest

echo $(date -u) "BUILD SUCCESSFUL!"

exit 0
