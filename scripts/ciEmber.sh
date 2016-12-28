#!/bin/bash -lx
# Usage:
# `bash scripts/ciEmber.sh`
# Or, with randomization…
# optional 1st argument `-rand` is used to randomize the tests
# optional 2nd argument (Integer) `n` is used for the iteration count for random tests, default is 1
# `./scripts/ciEmber.sh -rand 10`

echo $(date -u) "EMBER BUILD STARTED!"
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

function emberTest {
  # ember exam may also issue `ember` commands
  alias ember='./node_modules/ember-cli/bin/ember'
  if [ "$(uname)" == "Darwin" ]; then
    if [[ -n "$random" ]]; then
      ember exam:iterate $count --options -f='general'
    else
      ember test -f general
    fi
  else
    if [[ -n "$random" ]]; then
      xvfb-run ember exam:iterate $count --options -f='general'
    else
      xvfb-run ember test -f general
    fi
  fi
  EMBER_TEST=$?
  if [ "$EMBER_TEST" == 1 ]; then
    echo "ember tests failed"
    exit $EMBER_TEST
  fi
}

cd bsrs-ember

echo $(date -u) "NPM INSTALL"
npmInstall

echo $(date -u) "EMBER TESTS"
emberTest

echo $(date -u) "BUILD SUCCESSFUL!"

exit 0
