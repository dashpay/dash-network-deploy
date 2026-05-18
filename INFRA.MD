# Testnet Infrastructure Operations Guide

## Architecture Overview

Each HP masternode runs **dashmate** which orchestrates Docker containers for:
- **Core** (`dashmate_testnet-core-1`): Dash Core daemon (dashd)
- **Drive ABCI** (`dashmate_testnet-drive_abci-1`): Platform state machine
- **Drive Tenderdash** (`dashmate_testnet-drive_tenderdash-1`): BFT consensus engine
- **Gateway** (`dashmate_testnet-gateway-1`): Envoy proxy for DAPI
- **RS DAPI** (`dashmate_testnet-rs_dapi-1`): Rust DAPI implementation
- **Dashmate Helper** (`dashmate_testnet-dashmate_helper-1`): Background tasks
- **Gateway Rate Limiter** (`dashmate_testnet-gateway_rate_limiter-1`): Rate limiting (Redis + metrics)

The wallet node (`dashd-wallet-1`) runs standalone dashd with the MNO wallet for managing masternode registrations and collateral.

## Key Files

| File | Purpose |
|------|---------|
| `networks/testnet.yml` | Node keys (owner, collateral, operator, node_key), dashmate version, passwords |
| `networks/testnet.inventory` | Ansible inventory with IPs, protx hashes, host groups |
| `ansible/deploy.yml` | Main deployment playbook with tagged plays |
| `ansible/roles/dashmate/` | Dashmate installation, config, SSL, restart logic |
| `ansible/roles/mn_init/` | Masternode registration (key import, collateral funding, protx register) |
| `ansible/roles/mn_unban/` | ProUpServTx to revive PoSe-banned nodes |

Note: `networks/` is a separate private git repo (`dashpay/dash-network-configs`), gitignored by the parent repo.

## Dashmate Commands

All dashmate commands must be run as the **dashmate** user:

```bash
# SSH to a node
ssh ubuntu@<IP>

# Status
sudo -u dashmate dashmate status

# Start/Stop/Restart
sudo -u dashmate dashmate start --verbose
sudo -u dashmate dashmate stop --verbose
sudo -u dashmate dashmate stop --force --verbose       # Skip DKG check
sudo -u dashmate dashmate restart --verbose
sudo -u dashmate dashmate restart --force --verbose     # Skip DKG check
sudo -u dashmate dashmate restart --platform --verbose  # Platform only, keeps Core running

# Config
sudo -u dashmate dashmate config get <path>
sudo -u dashmate dashmate config set <path> <value>
sudo -u dashmate dashmate config render --verbose       # Regenerate docker-compose from config
sudo -u dashmate dashmate config default testnet        # Set default config name

# SSL
sudo -u dashmate dashmate ssl obtain --verbose

# Core operations (run as root, not dashmate user)
sudo dashmate core reindex   # Interactive prompt - may hang in scripts
```

### Restart Modes

| Mode | Flag | Behaviour |
|------|------|-----------|
| Safe | (default) | Waits for DKG window, can timeout |
| No flags | `restart` | Refuses if DKG session is active |
| Force | `--force` | Always works, risks brief PoSe penalty |
| Platform only | `--platform` | Restarts platform services, leaves Core running |

## Checking Logs

```bash
# Docker logs (run as ubuntu or root)
sudo docker logs dashmate_testnet-core-1 --tail 50
sudo docker logs dashmate_testnet-drive_tenderdash-1 --tail 50
sudo docker logs dashmate_testnet-gateway-1 --tail 50
sudo docker logs dashmate_testnet-rs_dapi-1 --tail 50
sudo docker logs dashmate_testnet-drive_abci-1 --tail 50

# Log files on disk
ls -lhS /home/dashmate/logs/

# Common log files (can grow very large):
#   drive-json.log, drive-pretty.log      - Drive logs (can be 6GB+)
#   drive-grovedb-operations.log          - GroveDB ops (can be 4GB+)
#   tenderdash.log                        - Tenderdash consensus
#   core.log                              - Dash Core
```

## Common Issues and Fixes

### EvoDB Inconsistency / Core Stuck

**Symptoms**: Core crashes with `Found EvoDB inconsistency, you must reindex to continue` or core is stuck at a height with "Potential stale tip detected" and block headers marked conflicting.

**Fix**: Wipe evoDB and chainstate, let core rebuild from existing block data:

```bash
sudo -u dashmate dashmate stop --force --verbose
sudo docker run --rm -v dashmate_testnet_core_data:/data alpine sh -c \
  'rm -rf /data/.dashcore/testnet3/evodb /data/.dashcore/testnet3/chainstate && echo done'
sudo -u dashmate dashmate start --verbose
```

Core will rebuild from block data (starts from height 0, takes hours for full testnet chain). Do NOT use `dashmate core reindex` as it has an interactive prompt that hangs in non-interactive contexts.

### Disk Full

**Symptoms**: Docker logs fail with `no space left on device`, core crashes.

**Fix**: Truncate large log files:

```bash
df -h /
sudo du -sh /home/dashmate/logs/
sudo truncate -s 0 /home/dashmate/logs/drive-json.log \
  /home/dashmate/logs/drive-pretty.log \
  /home/dashmate/logs/drive-grovedb-operations.log \
  /home/dashmate/logs/tenderdash.log \
  /home/dashmate/logs/core.log
```

### Docker Network Overlap

**Symptoms**: `dashmate start` fails with `Pool overlaps with other one on this address space`.

**Fix**: Old containers/networks from a previous config prefix are conflicting:

```bash
sudo docker stop $(sudo docker ps -q)
sudo docker rm $(sudo docker ps -aq)
sudo docker network prune -f
sudo -u dashmate dashmate start --verbose
```

### Platform Error (Tenderdash crash-looping)

**Symptoms**: Platform status shows `error`, tenderdash logs show `unexpected masternode state POSE_BANNED`.

**Cause**: Tenderdash refuses to start if the masternode is PoSe-banned. Fix the ban first (see ProUpServTx below), then tenderdash will start automatically on its next restart cycle.

### SSL Certificate Issues

**Symptoms**: Platform in error, gateway can't serve HTTPS.

**Prerequisites for `dashmate ssl obtain`**:
- `externalIp` must be set in config
- `platform.gateway.ssl.enabled` must be `true`
- `platform.gateway.ssl.providerConfigs.zerossl.apiKey` must be set
- SSL directory must contain files not directories (if directories exist at `bundle.crt` or `private.key` paths, `rm -rf` them first)

```bash
# Check current SSL config
sudo -u dashmate dashmate config get platform.gateway.ssl

# Set required values if missing
sudo -u dashmate dashmate config set externalIp <IP>
sudo -u dashmate dashmate config set platform.gateway.ssl.enabled true
sudo -u dashmate dashmate config set platform.gateway.ssl.providerConfigs.zerossl.apiKey <key>

# Obtain cert
sudo -u dashmate dashmate ssl obtain --verbose

# Fix if bundle.crt/private.key are directories instead of files
sudo rm -rf /root/.dashmate/testnet/platform/gateway/ssl/bundle.crt
sudo rm -rf /root/.dashmate/testnet/platform/gateway/ssl/private.key
sudo -u dashmate dashmate ssl obtain --verbose
```

### Dashmate Config Not Taking Effect

**Symptom**: Config file on disk has correct values but `dashmate config get` returns null.

**Cause**: The config.json was written by ansible but dashmate's internal state diverged. Use `dashmate config set` to set values explicitly, or `dashmate config render` to regenerate service configs.

## ProTx Lifecycle

### Fresh Registration

Run via ansible:
```bash
./bin/deploy -p --tags=unban_hp_masternodes testnet
```

This handles: key import, wallet rescan, collateral funding (4000 DASH), `protx register_evo`, and writing protx hash to inventory.

### Unbanning (ProUpServTx)

When a node is PoSe-banned, send a ProUpServTx to revive it:

```bash
# From the wallet node
dash-cli -rpcwallet=dashd-wallet-1-mno protx update_service_evo \
  <protx_hash> \
  '<IP>:19999' \
  <operator_private_key> \
  <platform_node_id> \
  36656 1443
```

If you get `protx-dup`, it means the on-chain details already match. Use a fee source address to make the transaction unique:

```bash
# Fund the owner address first
dash-cli -rpcwallet=dashd-wallet-1-mno sendtoaddress <owner_address> 0.01

# Then use it as fee source (last parameter)
dash-cli -rpcwallet=dashd-wallet-1-mno protx update_service_evo \
  <protx_hash> '<IP>:19999' <operator_private_key> \
  <platform_node_id> 36656 1443 '' <owner_address>
```

### Checking ProTx Status

```bash
# From wallet node
dash-cli -rpcwallet=dashd-wallet-1-mno protx info <protx_hash>

# Key fields:
#   PoSePenalty: 0 = healthy, 543 = max (banned)
#   PoSeBanHeight: -1 = not banned, >0 = banned at this height
#   PoSeRevivedHeight: -1 = never revived, >0 = revived at this height
```

## Ansible Deployment

### Common Commands

```bash
# Full deploy to all nodes
./bin/deploy -p testnet

# Dashmate deploy to specific node(s)
./bin/deploy -p --tags=dashmate_deploy -a='--limit hp-masternode-3' testnet

# Fast mode (skips SSL, filebeat, image updates)
./bin/deploy -p --fast --tags=dashmate_deploy testnet

# Registration / unban only
./bin/deploy -p --tags=unban_hp_masternodes testnet
```

### Ansible Environment Setup

```bash
# Requires nix-shell for nodejs, and ansible venv
nix-shell -p nodejs_20 python3 --run "export PATH=/tmp/ansible-venv/bin:\$PATH && ./bin/deploy ..."

# Required pip packages in /tmp/ansible-venv:
#   ansible, netaddr, boto3, botocore

# Required ansible galaxy roles:
#   geerlingguy.filebeat, elastic.beats
```

### Known Ansible Gotchas

- **`gather_facts: false`** in deploy.yml (line 338) was changed to `true` because `geerlingguy.filebeat` needs `ansible_facts.os_family`
- **`default()` filter** does NOT trigger for YAML null values, only for undefined. Use `default(value, true)` for falsy values
- **`dashmate_core_rpc_quorum_list_password`** must be explicitly set in testnet.yml (not null) for dashmate 3.0.1 config validation
- **`rescanblockchain`** via ansible can appear to hang - the RPC is synchronous and blocks until complete on the full testnet chain

## AWS / IP Management

HP masternodes use a mix of standard EIPs and BYOIP addresses.

```bash
# Allocate a specific BYOIP address
aws ec2 allocate-address --region us-west-2 \
  --address 68.67.122.X \
  --ipam-pool-id ipam-pool-0de83ed8bba5f9b48

# Associate with an instance
aws ec2 associate-address --region us-west-2 \
  --allocation-id eipalloc-XXXXX \
  --instance-id i-XXXXX

# Release an old EIP
aws ec2 disassociate-address --region us-west-2 --association-id eipassoc-XXXXX
aws ec2 release-address --region us-west-2 --allocation-id eipalloc-XXXXX
```

## Current Node Status (as of 2026-02-26)

| Node | Status | Notes |
|------|--------|-------|
| hp-masternode-3 | READY, PoSe=0, Platform syncing | Freshly registered with new IP 68.67.122.3 |
| hp-masternode-4 | READY, PoSe=0, Platform syncing | Re-registered in previous session |
| hp-masternode-6 | READY, PoSe=0, Platform syncing | Re-registered in previous session |
| hp-masternode-16 | READY, PoSe=0, Platform up | rs-dapi metrics config updated |
| hp-masternode-18 | Syncing (99.97%) | Recently unbanned, waiting for core sync |
| hp-masternode-22 | Rebuilding chainstate | EvoDB corruption + disk full, logs truncated, rebuilding |
| hp-masternode-29 | Rebuilding chainstate | Stuck on conflicting block, evoDB wiped, rebuilding |
