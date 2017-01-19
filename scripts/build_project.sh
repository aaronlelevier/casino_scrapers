#!/bin/bash -lx

echo "BUILD EMBER"

# Start at root of project
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR
cd ../

cd bsrs-ember
yarn install

rm -rf tmp dist
wait
./node_modules/ember-cli/bin/ember build --env=production

cd ../bsrs-django/bigsky

wait
rm -rf ember/*
rm -rf static/*
rm -rf templates/index.html
wait
cp -r ../../bsrs-ember/dist/assets ember
cp -r ../../bsrs-ember/dist/css ember
cp -r ../../bsrs-ember/dist/fonts ember
cp -r ../../bsrs-ember/dist/index.html templates
wait
./manage.py collectstatic --noinput

echo "MIGRATE DATABASE"
wait
dropdb ci
wait
createdb ci
wait
./manage.py migrate

echo "LOAD FIXTURE DATA"
cd ../../
DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi
. "$DIR/_load_fixtures.sh"
