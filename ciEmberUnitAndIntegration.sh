#!/bin/bash -lx

echo $(date -u) "EMBER UNIT AND INTEGRATION BUILD STARTED!"

function npmInstall {
    npm install --no-optional
    NPM_INSTALL=$?
    echo $NPM_INSTALL
    if [ "$NPM_INSTALL" == 1 ]; then
      echo "npm install failed"
      exit $NPM_INSTALL
    fi
}

function emberUnitTest {
    if [ "$(uname)" == "Darwin" ]; then
      ./node_modules/ember-cli/bin/ember test -f unit
    else
      xvfb-run ./node_modules/ember-cli/bin/ember test -f unit
    fi
    EMBER_TEST=$?
    if [ "$EMBER_TEST" == 1 ]; then
      echo "ember unit tests failed"
      exit $EMBER_TEST
    fi
}

function emberIntegrationTest {
    if [ "$(uname)" == "Darwin" ]; then
      ./node_modules/ember-cli/bin/ember test -f integration
    else
      xvfb-run ./node_modules/ember-cli/bin/ember test -f integration
    fi
    EMBER_TEST=$?
    if [ "$EMBER_TEST" == 1 ]; then
      echo "ember integration tests failed"
      exit $EMBER_TEST
    fi
}

cd bsrs-ember

echo $(date -u) "NPM INSTALL"
npmInstall

echo $(date -u) "EMBER UNIT TESTS"
emberUnitTest

# echo $(date -u) "EMBER INTEGRATION TESTS"
# emberIntegrationTest

echo $(date -u) "BUILD SUCCESSFUL!"

exit 0
