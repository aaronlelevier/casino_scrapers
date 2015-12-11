#!/bin/bash -lx

echo "LOAD ANY FIXTURES THAT WILL NOT BE CREATED FROM A \
DOMINO -> TO -> DJANGO INSERT"

export DJANGO_SETTINGS_MODULE='bigsky.settings.persistent'

source ../venv/bin/activate

./manage.py loaddata utils_transforms/fixtures/location_levels.json
