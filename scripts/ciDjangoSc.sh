#!/bin/bash -lx

# 'sc' app tests for Service Channel integration

export BUILD='ci_sc'

DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi
. "$DIR/_ciDjangoBase.sh"