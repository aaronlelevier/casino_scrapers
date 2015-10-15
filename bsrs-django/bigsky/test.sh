#!/bin/bash
# Use > 1 to consume two arguments per pass in the loop (e.g. each
# argument has a corresponding value to go with it).
# Use > 0 to consume one or more arguments per pass in the loop (e.g.
# some arguments don't have a corresponding value to go with it such
# as in the --default example).
# note: if this is set to > 0 the /etc/hosts part is not recognized ( may be a bug )
while [[ $# > 1 ]]
do
key="$1"

case $key in
  -e|--test_ember)
  TEST_EMBER="$2"
  shift # past argument
  ;;
  *)
  ;;
esac
shift # past argument or value
done

if [ "$TEST_EMBER" == "true" ]; 
  then
    echo "TEST EMBER: YES"
  else
    echo "TEST EMBER: NO"
fi