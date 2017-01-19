#!/bin/bash -lx
# Usage:
# `bash scripts/ciEmberUnitAndIntegration.sh`
# Or, with randomization…
# optional 1st argument `-rand` is used to randomize the tests
# optional 2nd argument (Integer) `n` is used for the iteration count for random tests, default is 1
# `./scripts/ciEmberUnitAndIntegration.sh -rand 10`

echo $(date -u) "EMBER UNIT AND INTEGRATION BUILD STARTED!"
source ~/.bashrc
echo "Node Version:"
node --version

# 1st arg used to run tests in random order
random=''
# 2nd arg used for the number of iterations to run in random order
count=1
if [ "$1" == "-rand" ]; then
  random='yes'
  if (( $2 > 1 )) 2>/dev/null; then
    count=$2
  fi
fi

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

function bowerInstall {
  bower install
  BOWER_INSTALL=$?
  echo $BOWER_INSTALL
  if [ "$BOWER_INSTALL" == 1 ]; then
    echo "bower install failed"
    exit $BOWER_INSTALL
  fi
}

function emberUnitTest {
  alias ember='./node_modules/ember-cli/bin/ember'
  if [ "$(uname)" == "Darwin" ]; then
    if [[ -n "$random" ]]; then
      ember exam:iterate $count --options -f='unit'
    else
      ember test -f='unit'
    fi
  else
    if [[ -n "$random" ]]; then
      xvfb-run ember exam:iterate $count --options -f='unit'
    else
      xvfb-run ember test -f='unit'
    fi
  fi
  EMBER_TEST=$?
  if [ "$EMBER_TEST" == 1 ]; then
    echo "ember unit tests failed"
    exit $EMBER_TEST
  fi
}

function emberIntegrationTest {
  alias ember='./node_modules/ember-cli/bin/ember'
  if [ "$(uname)" == "Darwin" ]; then
    if [[ -n "$random" ]]; then
      ember exam:iterate $count --options -f='integration'
    else
      ember test -f='integration'
    fi
  else
    if [[ -n "$random" ]]; then
      xvfb-run ember exam:iterate $count --options -f='integration'
    else
      xvfb-run ember test -f='integration'
    fi
  fi
  EMBER_TEST=$?
  if [ "$EMBER_TEST" == 1 ]; then
    echo "ember integration tests failed"
    exit $EMBER_TEST
  fi
}

function emberAddonTest {
  alias ember='./node_modules/ember-cli/bin/ember'
  if [ "$(uname)" == "Darwin" ]; then
    if [[ -n "$random" ]]; then
      ember exam:iterate $count
    else
      ember test
    fi
  else
    if [[ -n "$random" ]]; then
      xvfb-run ember exam:iterate $count
    else
      xvfb-run ember test
    fi
  fi
  EMBER_TEST=$?
  if [" $EMBER_TEST" == 1 ]; then
    echo "ember addon tests failed"
    exit $EMBER_TEST
  fi
}

cd bsrs-ember

echo $(date -u) "YARN (NPM) INSTALL"
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
bowerInstall
echo $(date -u) "EMBER ADDON TESTS"
emberAddonTest

echo $(date -u) "BUILD SUCCESSFUL!"

exit 0
