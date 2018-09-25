#!/usr/bin/env bash

scripts=("deploy destroy test")

if [[ " ${scripts[@]} " =~ " ${1} " ]]; then
    source bin/$1
else
    exec "$@"
fi
