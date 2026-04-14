# HP Masternode Backup

This workflow is scoped to `hp_masternodes` only. It is intended to be manual and trigger-only.

## Design

- The backup script is installed on HP masternodes one time with a dedicated Ansible role.
- A separate playbook runs the backup on demand.
- Backup execution is batched by default to avoid hitting all HPMNs at once.
- The backup archive is uploaded directly from each HP masternode to S3.
- No reboot, service stop, or platform reset is part of this flow.
- `deploy.yml` is intentionally untouched. Use the dedicated playbooks instead of `./bin/deploy -p`.

## What Gets Backed Up

The current backup script captures the highest-value runtime state it can find without stopping services:

- `/home/dashmate/.dashmate/config.json`
- `/home/dashmate/.dashmate/<network>/platform/drive/tenderdash`
- `/home/dashmate/.dashmate/<network>/platform/gateway/ssl`
- Tenderdash named volume data under:
  - `/var/lib/docker/volumes/dashmate_<network>_drive_tenderdash/_data`
- likely Dash Core quorum state under Docker volume paths such as:
  - `/var/lib/docker/volumes/dashmate_<network>_core_data/_data/.dashcore/testnet3/llmq`

The script also performs runtime discovery for:

- `priv_validator_key.json`
- `priv_validator_state.json`
- `node_key.json`

Each archive contains a `manifest.txt` that records included and missing paths.

## S3 Layout

Objects are stamped by network, host, timestamp, and trigger label:

```text
s3://<bucket>/<prefix>/<network>/<hostname>/<timestamp>_<label>.tar.gz
```

Example:

```text
s3://dash-hpmn-backups/hpmn-backups/testnet/hp-masternode-7/20260414T183500Z_pre-upgrade-check.tar.gz
```

## One-Time Install

Install the backup prerequisites and script on all HP masternodes:

```bash
ansible-playbook \
  -i networks/testnet.inventory \
  ansible/hpmn_backup_install.yml \
  -e @networks/testnet.yml \
  -e dash_network_name=testnet
```

Install on a single node first:

```bash
ansible-playbook \
  -i networks/testnet.inventory \
  ansible/hpmn_backup_install.yml \
  -e @networks/testnet.yml \
  -e dash_network_name=testnet \
  --limit hp-masternode-1
```

## Manual Trigger

Run a backup on demand. Credentials remain on the control machine and are only passed for that run:

```bash
AWS_ACCESS_KEY_ID=... \
AWS_SECRET_ACCESS_KEY=... \
AWS_REGION=us-west-2 \
HPMN_BACKUP_S3_BUCKET=your-bucket \
HPMN_BACKUP_S3_PREFIX=hpmn-backups \
ansible-playbook \
  -i networks/testnet.inventory \
  ansible/hpmn_backup_run.yml \
  -e @networks/testnet.yml \
  -e dash_network_name=testnet \
  -e hpmn_backup_trigger_label=manual-test
```

Target a single HP masternode first during validation:

```bash
AWS_ACCESS_KEY_ID=... \
AWS_SECRET_ACCESS_KEY=... \
AWS_REGION=us-west-2 \
HPMN_BACKUP_S3_BUCKET=your-bucket \
ansible-playbook \
  -i networks/testnet.inventory \
  ansible/hpmn_backup_run.yml \
  -e @networks/testnet.yml \
  -e dash_network_name=testnet \
  -e hpmn_backup_trigger_label=single-node-test \
  --limit hp-masternode-1
```

Run a fleet operation in controlled batches:

```bash
AWS_ACCESS_KEY_ID=... \
AWS_SECRET_ACCESS_KEY=... \
AWS_SESSION_TOKEN=... \
AWS_REGION=us-west-2 \
HPMN_BACKUP_S3_BUCKET=dash-testnet-hpmns-backups \
ansible-playbook \
  -i networks/testnet.inventory \
  ansible/hpmn_backup_run.yml \
  -e @networks/testnet.yml \
  -e dash_network_name=testnet \
  -e hpmn_backup_trigger_label=batch-run \
  -e hpmn_backup_serial=5 \
  --limit hp_masternodes
```

## GitHub Actions Workflow

Use `.github/workflows/hpmn-backup.yml` for a manual `workflow_dispatch` run.

Suggested secrets:

- `DEPLOY_SERVER_KEY`
- `EVO_APP_DEPLOY_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `HPMN_BACKUP_S3_KMS_KEY_ID` if using SSE-KMS

Suggested repository variables:

- `HPMN_BACKUP_S3_BUCKET`
- `HPMN_BACKUP_S3_PREFIX`
- `HPMN_BACKUP_S3_SSE_MODE`

If `HPMN_BACKUP_S3_SSE_MODE` is `AES256`, leave the KMS key secret empty.
If it is `aws:kms`, set `HPMN_BACKUP_S3_KMS_KEY_ID`.

## Restore

Restore is intentionally single-host only. Use a replacement or disposable HP masternode, not the whole group.

For the full tested step-by-step recovery procedure, including public IP cutover, replacement host provisioning, restore, finalize, verification, and troubleshooting, use [`docs/hpmn-recovery.md`](/home/vivek/code/dash-network-deploy/docs/hpmn-recovery.md).

One-time restore tooling install:

```bash
ansible-playbook \
  -i networks/testnet.inventory \
  ansible/hpmn_restore_install.yml \
  -e @networks/testnet.yml \
  -e dash_network_name=testnet \
  --limit hp-masternode-1
```

Run restore from a specific backup archive:

```bash
AWS_ACCESS_KEY_ID=... \
AWS_SECRET_ACCESS_KEY=... \
AWS_SESSION_TOKEN=... \
AWS_REGION=us-west-2 \
ansible-playbook \
  -i networks/testnet.inventory \
  ansible/hpmn_restore_run.yml \
  -e @networks/testnet.yml \
  -e dash_network_name=testnet \
  -e hpmn_restore_s3_uri=s3://dash-testnet-hpmns-backups/hpmn-backups/testnet/hp-masternode-1/example.tar.gz \
  -e hpmn_restore_start_services=false \
  --limit hp-masternode-1
```

Finalize the restored host so dashmate config is regenerated for the replacement node's inventory values and services start cleanly:

```bash
AWS_REGION=us-west-2 \
ansible-playbook \
  -i networks/testnet.inventory \
  ansible/hpmn_restore_finalize.yml \
  -e @networks/testnet.yml \
  -e dash_network_name=testnet \
  -e dash_network=testnet \
  --limit hp-masternode-1
```

There is also a dedicated `workflow_dispatch` GitHub Actions workflow at `.github/workflows/hpmn-restore.yml`. By default it restores without auto-starting services, then runs the finalize playbook.

## Restore Notes

- Restore should be tested on a single replacement node first.
- Do not bring up a second live validator with the same identity while the original HP masternode is still active.
- The archive manifest should be reviewed before restore so we know exactly which runtime files were captured from that host.
- On a replacement host, run the finalize step after restore so `config.json` and rendered dashmate files use the replacement node's actual inventory IPs.
