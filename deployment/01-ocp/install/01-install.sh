#!/usr/bin/env bash

cd ..

oc apply -f ./yaml/ --validate=false
