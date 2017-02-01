#!/bin/bash -lx

cd bsrs-django/bigsky/

while read P; do
    wait
    python $P
done <"../../_fixtures.txt"
