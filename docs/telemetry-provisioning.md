# Telemetry provisioning boundaries

Routine Metricbeat collection always renders `setup.dashboards.enabled: false`.
An unreachable optional Kibana endpoint must not abort the collector at startup.
This does **not** prove Elasticsearch delivery: output failures and unshipped
Filebeat backlog must remain observable. Existing output credentials, modules,
queues and stored data are not changed by this correction. Do not retarget a
collector until the intended backend identity/ownership is independently known.
If Metricbeat is enabled but `logs_nodes` / the configured `logs-1` identity is
absent, the role fails before installation/configuration. An intentionally
retired backend requires explicit shipper retirement preserving pending data;
it must not be silently replaced, revived, or treated as successful delivery.

Dashboard loading is a separate, explicit operator action, not part of
`deploy.yml`. After verifying the intended backend and current service activity,
select exactly one already-configured managed host:

```sh
ansible-playbook -i <verified-inventory> ansible/setup-metricbeat-dashboards.yml \
  --limit <one-managed-host> \
  -e metricbeat_provision_dashboards=true \
  -e metricbeat_dashboard_backend_verified=true
```

The command reuses the existing protected Metricbeat configuration (including
its Kibana settings). It temporarily enables dashboard loading only for that
one command, uses separate temporary state, has a 120-second task timeout and
never restarts the collector. Failure stays a failed provisioning action;
credentials/output are suppressed and task-owned temporary state is removed.
Check mode validates opt-in/target selection but does not load dashboards.
These flags are an explicit operator gate, not independent backend verification.

## Rotation ownership

`dashd/tasks/logrotate.yml` installs the package first (including fresh-host
drop-ins), then checks package-owned `/etc/logrotate.d/wtmp` and
`btmp`. The upstream role emits an inline rule only when the corresponding
package file is absent. This prevents duplicate entries while preserving
package settings such as wtmp `minsize 1M`, with a legacy-host fallback. Core
log policy and all other global/application rotation settings remain unchanged.

## Scoped rollout and rollback

Do not run a full deployment to apply this small correction. Inspect exact live
configuration, activity, instance/network identity and authoritative inventory
first. The old checkout may contain unrelated adaptations; this source change
must be reviewed/cherry-picked without replacing those adaptations. Disabled
logging roles in newer deployment branches must not be silently re-enabled.
A full deployment can change unrelated services and is not authorized by this
source-only correction.

Validate the complete rendered configuration and `metricbeat test config`;
back up protected configuration before targeted changes. Restart only the
collector if needed after its activity/impact gate; verify stable process,
restart count, log growth, actual output and preserved application/container
health. For logrotate use full-config debug validation and a normal non-forced
service run, not file deletion/truncation. Verify the next natural rotation.

Rollback source with a revert of this commit. Live rollback requires the same
gates and host-specific backups; restoring dashboard autoload recreates the
known startup dependency. Never discard backlogs to make disk alarms green.

## Offline regression validation

Use an isolated Python environment with `ansible-core==2.16.14` (and PyYAML):

```sh
python -m unittest discover -s test/ansible -v
ansible-playbook --syntax-check -i localhost, ansible/setup-metricbeat-dashboards.yml
```

The tests run only local fixture playbooks: the upstream collector role is
stubbed to inspect rendered settings, and setup runs in check mode. No live
configuration, package, service, database or network is changed by the tests.
