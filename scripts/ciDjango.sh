#!/bin/bash -lx

export BUILD='ci'

DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi
. "$DIR/_ciDjangoBase.sh"