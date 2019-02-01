#!/usr/bin/env bash

scripts=("deploy destroy test list dash-cli")

if [[ " ${scripts[@]} " =~ " ${1} " ]]; then
    source bin/$1
else
    exec "$@"
fi
