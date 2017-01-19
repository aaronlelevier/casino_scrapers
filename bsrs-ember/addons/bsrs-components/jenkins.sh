#!/bin/bash

echo $(date -u) "EMBER COMPONENT BUILD STARTED!"

function npmInstall {
    yarn install --no-optional
    NPM_INSTALL=$?
    bower install
    NPM_INSTALL=$?
    echo $NPM_INSTALL
    if [ "$NPM_INSTALL" == 1 ]; then
      echo "yarn install failed"
      exit $NPM_INSTALL
    fi
}

function emberUnitTest {
    if [ "$(uname)" == "Darwin" ]; then
      ./node_modules/ember-cli/bin/ember test
    else
      xvfb-run ./node_modules/ember-cli/bin/ember test
    fi
    EMBER_TEST=$?
    if [ "$EMBER_TEST" == 1 ]; then
      echo "ember component tests failed"
      exit $EMBER_TEST
    fi
}

echo $(date -u) "YARN (NPM) INSTALL"
npmInstall

echo $(date -u) "EMBER UNIT TESTS"
emberUnitTest

echo $(date -u) "BUILD SUCCESSFUL!"
