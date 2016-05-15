#!/bin/bash

# activate virtualenv
. /appenv/bin/activate

# relinquishes control to bash shell program w/o creating new process
# $@ is for any arguments
# entrypoint.sh python manage.py test

exec $@

