#!/bin/bash
# /usr/local/bin/dashmon-check
# Read-only monitoring script for the dash testnet status dashboard.
# Deployed to all masternodes. This is the forced command for the dashmon SSH key.
# Detects HP vs regular masternode by checking for dashmate configuration.
set -euo pipefail

if [[ -f /home/dashmate/.dashmate/config.json ]]; then
    # HP masternode: dashmate status as the dashmate user
    sudo -u dashmate dashmate status 2>&1
    echo "===TENDERDASH==="
    # Query Tenderdash RPC for proposer info (localhost only, no sudo needed)
    python3 -c '
import json, urllib.request
try:
    def fetch(path):
        return json.loads(urllib.request.urlopen(
            "http://127.0.0.1:36657" + path, timeout=5
        ).read())
    validators = fetch("/validators?per_page=100")
    sorted_ptx = sorted(v["pro_tx_hash"] for v in validators["validators"])
    block = fetch("/block")
    header = block["block"]["header"]
    cur_prop = header["proposer_pro_tx_hash"]
    height = int(header["height"])
    idx = sorted_ptx.index(cur_prop)
    next_prop = sorted_ptx[(idx + 1) % len(sorted_ptx)]
    print(json.dumps({"currentProposer": cur_prop,
                       "nextProposer": next_prop, "platformHeight": height}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
' 2>/dev/null || echo '{"error":"tenderdash-unavailable"}'
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
