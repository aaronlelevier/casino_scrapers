#!/bin/bash -lx

export BUILD='persistent'
export TEST_FILTER='utils_transform'

DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi
. "$DIR/_ciDjangoBase.sh"