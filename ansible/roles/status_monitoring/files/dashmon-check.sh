#!/bin/bash
# /usr/local/bin/dashmon-check
# Read-only monitoring script for the dash testnet status dashboard.
# Deployed to all masternodes. This is the forced command for the dashmon SSH key.
# Detects HP vs regular masternode by checking for dashmate configuration.
set -euo pipefail

if [[ -f /home/dashmate/.dashmate/config.json ]]; then
    # HP masternode: dashmate status as the dashmate user
    sudo -u dashmate dashmate status 2>&1
    echo "===SYSMETRICS==="
else
    # Regular masternode: dash-cli as the ubuntu user
    echo "===BLOCKCHAIN==="
    sudo -u ubuntu dash-cli getblockchaininfo 2>&1 || true
    echo "===MASTERNODE==="
    sudo -u ubuntu dash-cli masternode status 2>&1 || true
    echo "===SYSMETRICS==="
fi

# System metrics (no privileges needed)
head -1 /proc/loadavg
nproc
free -m | grep Mem
df -h / | tail -1
