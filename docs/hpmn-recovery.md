# HP Masternode Recovery Runbook

This document describes the tested recovery procedure for a single `testnet` HP masternode using the HPMN backup archive stored in S3.

It is written to be followed by both humans and AI agents.

## Scope

This runbook is for:

- a single replacement or disposable HP masternode
- `testnet`
- restore from the HPMN backup archive created by the backup role in this repo

This runbook is not for:

- restoring all HPMNs at once
- regular masternodes
- full fleet automation without human review

## Important Rules

- Never bring up a second live validator with the same identity while the original node is still active.
- Stop or isolate the original HPMN before moving identity and public IP to a replacement host.
- On a replacement host, do not rely on the archived `config.json` alone for final startup.
- The correct recovery flow is:
  1. provision replacement host
  2. restore archive
  3. finalize the host so dashmate config is regenerated for the replacement host's actual inventory values
  4. verify sync and network acceptance

## What the Backup Contains

The current HPMN backup captures:

- `/home/dashmate/.dashmate/config.json`
- `/home/dashmate/.dashmate/<network>/platform/drive/tenderdash`
- `/home/dashmate/.dashmate/<network>/platform/gateway/ssl`
- `/var/lib/docker/volumes/dashmate_<network>_drive_tenderdash/_data`
- `/var/lib/docker/volumes/dashmate_<network>_drive_abci_data/_data`
- `/var/lib/docker/volumes/dashmate_<network>_core_data/_data/.dashcore/testnet3/llmq`
- runtime discovery hits for:
  - `priv_validator_key.json`
  - `priv_validator_state.json`
  - `node_key.json`

Each archive also contains `manifest.txt`.

## Recovery Outcome From Rehearsal

The first recovery rehearsal on `hp-masternode-1` proved:

- the archive can be restored onto a replacement host
- the old public IP can be moved to the replacement host
- all dashmate services can be brought up on the replacement host
- recovery requires a finalize step after restore so host-specific config is rerendered with the replacement node's real private IP

The first rehearsal also exposed an incomplete backup scope:

- the restored node eventually hit `votes extensions mismatch`
- the node became `POSE_BANNED`
- the missing runtime state was the Drive ABCI Docker volume at `/var/lib/docker/volumes/dashmate_<network>_drive_abci_data/_data`

The backup role has since been updated to include that Drive ABCI volume.
The next restore rehearsal must use a fresh archive created after that fix.

## Inputs You Need

- the target host name, for example `hp-masternode-1`
- the backup archive S3 URI
- AWS credentials with access to the backup bucket
- `AWS_REGION`
- SSH access to the target host
- the replacement instance details:
  - instance id
  - public IP / reassigned EIP or BYOIP allocation
  - private IP
  - subnet
  - security groups
  - IAM instance profile
  - root volume sizing
- a temporary inventory override or updated inventory entry that reflects the replacement host's actual `private_ip`

## Repo Files Used During Recovery

- [`ansible/hpmn_restore_install.yml`](/home/vivek/code/dash-network-deploy/ansible/hpmn_restore_install.yml)
- [`ansible/hpmn_restore_run.yml`](/home/vivek/code/dash-network-deploy/ansible/hpmn_restore_run.yml)
- [`ansible/hpmn_restore_finalize.yml`](/home/vivek/code/dash-network-deploy/ansible/hpmn_restore_finalize.yml)
- [`ansible/deploy.yml`](/home/vivek/code/dash-network-deploy/ansible/deploy.yml)
- [`docs/hpmn-backup.md`](/home/vivek/code/dash-network-deploy/docs/hpmn-backup.md)

## High-Level Recovery Flow

1. Identify the source node and the backup archive to restore.
2. Launch a replacement EC2 instance with matching baseline infrastructure settings.
3. Stop the old instance.
4. Move the original public IP to the replacement instance.
5. Prepare an inventory entry that points to the replacement instance and uses its real `private_ip`.
6. Provision the replacement host enough to install Docker, dashmate, and base config.
7. Install restore tooling.
8. Restore the archive without starting services from the archived config.
9. Finalize the host so dashmate regenerates host-specific config using the replacement host's inventory values.
10. Verify service health and wait for core/platform sync.
11. Confirm network acceptance before doing any broader rollout.

## Step-by-Step Procedure

### 1. Choose the Backup Archive

Example:

```text
s3://dash-testnet-hpmns-backups/hpmn-backups/testnet/hp-masternode-1/20260414T154955Z_abci-fix-test.tar.gz
```

Optional verification:

```bash
aws s3api head-object \
  --bucket dash-testnet-hpmns-backups \
  --key hpmn-backups/testnet/hp-masternode-1/20260414T154955Z_abci-fix-test.tar.gz \
  --region us-west-2
```

### 2. Launch a Replacement Instance

Launch a replacement EC2 instance that matches the original node closely enough for service parity:

- same region
- same subnet
- same security groups
- same IAM instance profile
- same key pair
- same root disk size/class
- same instance type unless there is a reason to change it

If this is a true failover rehearsal, keep the replacement host separate until the original is stopped and the public IP is moved.

### 3. Stop the Original HPMN

Do not restore the same HPMN identity onto a second live node while the original node is still active.

Example:

```bash
aws ec2 stop-instances \
  --instance-ids <old-instance-id> \
  --region us-west-2

aws ec2 wait instance-stopped \
  --instance-ids <old-instance-id> \
  --region us-west-2
```

### 4. Move the Public IP

Move the original public IP to the replacement instance.

Example:

```bash
aws ec2 associate-address \
  --allocation-id <allocation-id> \
  --instance-id <replacement-instance-id> \
  --allow-reassociation \
  --region us-west-2
```

Verify:

```bash
aws ec2 describe-addresses \
  --allocation-ids <allocation-id> \
  --region us-west-2
```

### 5. Prepare Inventory for the Replacement Host

The replacement host must use its actual private IP in inventory.

This matters because dashmate renders listeners and metrics bindings using `private_ip`.

If the original inventory entry still has the old private IP, create a temporary one-host override.

Example host line:

```text
hp-masternode-1 ansible_user='ubuntu' ansible_host=68.67.122.1 public_ip=68.67.122.1 private_ip=10.0.24.125
```

### 6. Bootstrap the Replacement Host

Run the one-host deploy flow against the replacement instance.

Required variables:

- `dash_network_name=testnet`
- `dash_network=testnet`

If you only need the replacement host to reach a baseline before restore, a limited one-host run is sufficient.

Example:

```bash
AWS_REGION=us-west-2 \
AWS_DEFAULT_REGION=us-west-2 \
ANSIBLE_LOCAL_TEMP=/tmp/ansible-local \
ANSIBLE_HOST_KEY_CHECKING=false \
ansible-playbook \
  -i /tmp/testnet-hp-masternode-1-cutover.inventory \
  ansible/deploy.yml \
  -e @networks/testnet.yml \
  -e dash_network_name=testnet \
  -e dash_network=testnet \
  --limit hp-masternode-1 \
  --private-key /home/vivek/.ssh/evo-app-deploy.rsa
```

Notes:

- the recovery rehearsal exposed fresh-host issues that are now fixed in repo:
  - `acl` is installed during bootstrap
  - the `dashmate` user is added to the `docker` group correctly
- if you only need the host bootstrapped before restore, later non-critical roles are less important than getting Docker and dashmate in place

### 7. Install Restore Tooling

```bash
ANSIBLE_LOCAL_TEMP=/tmp/ansible-local \
ANSIBLE_HOST_KEY_CHECKING=false \
ansible-playbook \
  -i /tmp/testnet-hp-masternode-1-cutover.inventory \
  ansible/hpmn_restore_install.yml \
  -e @networks/testnet.yml \
  -e dash_network_name=testnet \
  --limit hp-masternode-1 \
  --private-key /home/vivek/.ssh/evo-app-deploy.rsa
```

### 8. Restore the Archive

Important:

- pass AWS credentials and region from the control machine
- restore without auto-starting services

```bash
eval "$(aws configure export-credentials --format env)"

AWS_REGION=us-west-2 \
AWS_DEFAULT_REGION=us-west-2 \
ANSIBLE_LOCAL_TEMP=/tmp/ansible-local \
ANSIBLE_HOST_KEY_CHECKING=false \
ansible-playbook \
  -i /tmp/testnet-hp-masternode-1-cutover.inventory \
  ansible/hpmn_restore_run.yml \
  -e @networks/testnet.yml \
  -e dash_network_name=testnet \
  -e hpmn_restore_s3_uri=s3://dash-testnet-hpmns-backups/hpmn-backups/testnet/hp-masternode-1/20260414T154955Z_abci-fix-test.tar.gz \
  -e hpmn_restore_start_services=false \
  --limit hp-masternode-1 \
  --private-key /home/vivek/.ssh/evo-app-deploy.rsa
```

Why `hpmn_restore_start_services=false`:

- the archived `config.json` may still contain the old host's `private_ip`
- starting services before rerendering config can fail on listeners bound to the old private IP

### 9. Finalize the Restored Host

This step is required on a replacement host.

It regenerates dashmate config using the replacement host's inventory values and starts/restarts services cleanly.

```bash
AWS_REGION=us-west-2 \
AWS_DEFAULT_REGION=us-west-2 \
ANSIBLE_LOCAL_TEMP=/tmp/ansible-local \
ANSIBLE_HOST_KEY_CHECKING=false \
ansible-playbook \
  -i /tmp/testnet-hp-masternode-1-cutover.inventory \
  ansible/hpmn_restore_finalize.yml \
  -e @networks/testnet.yml \
  -e dash_network_name=testnet \
  -e dash_network=testnet \
  --limit hp-masternode-1 \
  --private-key /home/vivek/.ssh/evo-app-deploy.rsa
```

### 10. Verify Services

Check dashmate services:

```bash
sudo -u dashmate dashmate status services --format=json
```

Check running containers:

```bash
docker ps
```

### 11. Verify the Old Private IP Is Gone From Config

Example:

```bash
sudo grep -R "10.0.28.10" -n /home/dashmate/.dashmate
```

This should return no matches after finalize for a replacement host with a different private IP.

### 12. Wait for Core and Platform Sync

Do not judge recovery too early.

Useful checks:

```bash
dash-cli getblockchaininfo
dash-cli mnsync status
dash-cli masternode status
docker logs --tail=20 dashmate_testnet-drive_abci-1
```

Healthy progression looks like:

- `getblockcount` continues increasing
- `initialblockdownload` eventually becomes `false`
- `mnsync` reaches full sync
- `drive_abci` stops waiting for core to sync
- chainlock errors stop appearing
- `masternode status` moves away from `WAITING_FOR_PROTX`

### 13. Confirm Network Acceptance

Only after sync completes should you conclude the recovery fully passed.

Until then, the correct state is:

- service recovery passed
- network acceptance pending sync completion

## Common Failure Modes

### `Invalid endpoint: https://s3..amazonaws.com`

Cause:

- `AWS_REGION` was not present in the environment passed to the restore or backup run

Fix:

- export `AWS_REGION` and `AWS_DEFAULT_REGION`
- rerun the playbook

### `403` when reading the backup object from S3

Cause:

- the target host did not receive usable AWS credentials through the restore run

Fix:

```bash
eval "$(aws configure export-credentials --format env)"
```

Then rerun the restore playbook with those exported credentials in the controller environment.

### Dashmate refuses to stop due to DKG participation

Cause:

- dashmate protects against unsafe shutdown during DKG activity

Fix:

- in the tested restore script this is tolerated and the flow continues to stop relevant Docker containers directly
- this warning is not by itself a restore failure

### Service startup fails trying to bind the old private IP

Cause:

- archived `config.json` still contains the old host's private IP

Fix:

- do not start services directly from restore on a replacement host
- run `ansible/hpmn_restore_finalize.yml`

### `WAITING_FOR_PROTX` immediately after restore

Cause:

- often core is still syncing

Fix:

- wait for `getblockchaininfo` and `mnsync status` to catch up before treating this as a real failure

### `drive_abci` logs show `waiting for core to sync`

Cause:

- core is not fully synced or chainlocks are not yet available locally

Fix:

- continue waiting while block height advances
- reassess only after sync stabilizes

## Recommended Operator Decision Point

Before any fleet rollout:

- complete one-node restore rehearsal
- complete one-node sync validation
- confirm the node is accepted by the network after sync

Only after that should backup or recovery be expanded in batches across the remaining HPMNs.
