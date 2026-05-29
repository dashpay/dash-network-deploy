# Standalone Quorum List Server

`dash-network-deploy` can provision a standalone `dashpay/quorum-list-server`
node for networks that need a public quorum API endpoint.

Each enabled network gets a separate EC2 instance running the
`dashpay/quorum-list-server` Docker image, a private RPC connection to its seed
node, and a network-specific public HTTPS endpoint.

## Enable

Set a non-zero `quorum_list_server_count` in the network Terraform vars:

```hcl
quorum_list_server_count = 1
```

Optional Terraform settings:

```hcl
quorum_list_server_port           = 8080
quorum_list_server_instance_size  = "micro"
quorum_list_server_root_disk_size = 20
```

Terraform creates:

- `quorum-list-server-N` EC2 host(s)
- An Ansible inventory group named `quorum_list_servers`
- A classic ELB with an HTTPS listener and an internal HTTP health check
- An ACM certificate for `quorums.<network>.<main_domain>`
- A Route53 CNAME for `quorums.<network>.<main_domain>`

For devnets, `<network>` is derived generically from the Terraform workspace
name: `devnet-<name>` produces `quorums.<name>.<main_domain>`.

## Provisioning

The deploy playbook applies the `quorum_list_server` Ansible role to hosts in
the `quorum_list_servers` inventory group. The role writes
`/etc/quorum-list-server/config.toml` as root-readable group material and starts
the non-root Docker process with the root group so it can read the mounted
configuration while using host networking.

By default, the server reads quorum data from the first seed node over the
private VPC RPC endpoint:

```text
http://<seed-1-private-ip>:20002
```

The role uses the network's existing Dash Core RPC credentials from Ansible
vars. The HTTP JSON-RPC hop stays on private VPC addresses and is restricted by
the network security groups; it is not exposed through the public ELB. Do not
commit those credentials into docs or examples.

Optional Ansible vars:

```yaml
quorum_list_server_image: dashpay/quorum-list-server:latest
quorum_list_server_pull: true
quorum_list_server_port: 8080
quorum_list_server_previous_blocks_offset: 8
quorum_list_server_rpc_host: seed-1
quorum_list_server_version_check_host: ""
quorum_list_server_address_host_override: ""
```

The role passes the generic Dash network class (`mainnet`, `testnet`, `devnet`,
or `regtest`) to `quorum-list-server`. The Terraform workspace keeps the
specific `devnet-<name>` deployment identity, while the service receives
`devnet` and selects the standard Platform devnet LLMQ settings. Set
`quorum_list_server_pull: false` only for an image tag built locally on the
target host.

## Verify

After deploy:

```bash
curl -fsS https://quorums.<network>.<main_domain>/health
curl -fsS https://quorums.<network>.<main_domain>/quorums
```
