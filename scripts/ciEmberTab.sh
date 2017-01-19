#!/bin/bash -lx

echo $(date -u) "EMBER BUILD STARTED!"
source ~/.bashrc
node --version

# Start at root of project
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR
cd ../

function npmInstall {
    yarn cache clean
    bower cache clean
    yarn install
    NPM_INSTALL=$?
    echo $NPM_INSTALL
    if [ "$NPM_INSTALL" == 1 ]; then
      echo "yarn install failed"
      exit $NPM_INSTALL
    fi
}

function emberTest {
    if [ "$(uname)" == "Darwin" ]; then
      ./node_modules/ember-cli/bin/ember test -f tab
    else
      xvfb-run ./node_modules/ember-cli/bin/ember test -f tab
    fi
    EMBER_TEST=$?
    if [ "$EMBER_TEST" == 1 ]; then
      echo "ember tests failed"
      exit $EMBER_TEST
    fi
}

cd bsrs-ember

echo $(date -u) "YARN (NPM) INSTALL"
npmInstall

echo $(date -u) "EMBER TESTS"
emberTest

echo $(date -u) "BUILD SUCCESSFUL!"

exit 0
