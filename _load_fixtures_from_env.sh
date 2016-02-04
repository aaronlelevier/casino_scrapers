#!/bin/bash -lx

cd bsrs-django/bigsky/

while read P; do
  ../venv/bin/python $P
done <"../../_fixtures.txt"
