#!/bin/bash -lx


echo $(date -u) "DJANGO BUILD '$BUILD' STARTED!"

# Start at root of project
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR
cd ../

function pipInstall {
    echo "ENABLE SPECIFIC DJANGO SETTINGS FILE HERE B/C AFFECTS PIP INSTALL"
    export DJANGO_SETTINGS_MODULE='bigsky.settings.$BUILD'
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
    eval "python manage.py test $TEST_FILTER --settings=bigsky.settings.$BUILD --liveserver=localhost:8001 --noinput --verbosity=3"
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
