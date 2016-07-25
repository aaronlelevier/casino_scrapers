#!/bin/bash -lx

echo $(date -u) "EMBER UNIT AND INTEGRATION BUILD STARTED!"

# Start at root of project
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR
cd ../

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

function emberAddonTest {
  if [ "$(uname)" == "Darwin" ]; then
    ./node_modules/ember-cli/bin/ember test
  else
    xvfb-run ./node_modules/ember-cli/bin/ember test
  fi
  EMBER_TEST=$?
  if [" $EMBER_TEST" == 1 ]; then
    echo "ember addon tests failed"
    exit $EMBER_TEST
  fi
}

cd bsrs-ember

echo $(date -u) "NPM INSTALL"
npmInstall

echo $(date -u) "EMBER UNIT TESTS"
emberUnitTest

sleep 15s
rm -rf tmp dist

echo $(date -u) "EMBER INTEGRATION TESTS"
emberIntegrationTest

cd addons/bsrs-components
echo $(date -u) $(pwd) "NPM INSTALL ADDON"
npmInstall
echo $(date -u) "EMBER ADDON TESTS"
emberAddonTest

echo $(date -u) "BUILD SUCCESSFUL!"

exit 0
