#!/bin/bash -lx

echo "LOAD TEST DATA"
echo "run 'load_fixtures.sh' first, then run this script"

wait
./manage.py test_create_location_region
wait
./manage.py etl_location_region
