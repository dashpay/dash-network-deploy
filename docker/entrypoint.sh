#!/usr/bin/env bash

scripts=("deploy destroy test list logs dash-cli generate")

if [[ " ${scripts[@]} " =~ " ${1} " ]]; then
    script=$1

    # Remove the first argument ("dash-network")
    shift

    source "bin/$script"
else
    exec "$@"
fi
