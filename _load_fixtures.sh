#!/bin/bash -lx

cd bsrs-django/bigsky/

while read P; do
  python $P
done <"../../_fixtures.txt"
