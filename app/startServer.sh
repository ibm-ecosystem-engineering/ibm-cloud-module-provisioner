#!/bin/bash

export PROVISIONER_LOC_MODULES=/Users/jeyagandhi/Gandhi/95-data/provisioner/data/modules/
export PROVISIONER_LOC_META_DATA=/Users/jeyagandhi/Gandhi/95-data/provisioner/data/meta-data/

cd ..

go run cmd/web/main.go

