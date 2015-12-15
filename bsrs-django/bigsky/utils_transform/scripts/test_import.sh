#!/bin/bash -lx

echo "LOAD TEST DATA"
echo "run 'load_fixtures.sh' first, then run this script"

wait
./manage.py create_flat_location_tables
wait
./manage.py etl_location_region
./manage.py etl_location_district
./manage.py etl_location_store
