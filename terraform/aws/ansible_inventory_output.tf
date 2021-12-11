locals {
  web_hosts = [
    for n in range(length(aws_instance.web)) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.web.*.tags.Hostname, n)
        public_ip  = element(aws_instance.web.*.public_ip, n)
        private_ip = element(aws_instance.web.*.private_ip, n)
      }
    )
  ]

  logs_hosts = [
    for n in range(length(aws_instance.logs)) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.logs.*.tags.Hostname, n)
        public_ip  = element(aws_instance.logs.*.public_ip, n)
        private_ip = element(aws_instance.logs.*.private_ip, n)
      }
    )
  ]

    metrics_hosts = [
    for n in range(length(aws_instance.metrics)) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.metrics.*.tags.Hostname, n)
        public_ip  = element(aws_instance.metrics.*.public_ip, n)
        private_ip = element(aws_instance.metrics.*.private_ip, n)
      }
    )
  ]

  wallet_node_hosts = [
    for n in range(length(aws_instance.dashd_wallet)) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.dashd_wallet.*.tags.Hostname, n)
        public_ip  = element(aws_instance.dashd_wallet.*.public_ip, n)
        private_ip = element(aws_instance.dashd_wallet.*.private_ip, n)
      }
    )
  ]

  seed_node_hosts = [
    for n in range(length(aws_instance.seed_node)) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.seed_node.*.tags.Hostname, n)
        public_ip  = element(aws_instance.seed_node.*.public_ip, n)
        private_ip = element(aws_instance.seed_node.*.private_ip, n)
      }
    )
  ]

  miner_hosts = [
    for n in range(length(aws_instance.miner)) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.miner.*.tags.Hostname, n)
        public_ip  = element(aws_instance.miner.*.public_ip, n)
        private_ip = element(aws_instance.miner.*.private_ip, n)
      }
    )
  ]

  masternode_hosts = [
    for n in range(length(aws_instance.masternode)) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.masternode.*.tags.Hostname, n)
        public_ip  = element(aws_instance.masternode.*.public_ip, n)
        private_ip = element(aws_instance.masternode.*.private_ip, n)
      }
    )
  ]

  vpn = [
    for n in range(var.vpn_enabled ? 1 : 0) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.vpn.*.tags.Hostname, n)
        public_ip  = element(aws_eip.vpn.*.public_ip, n)
        private_ip = element(aws_instance.vpn.*.private_ip, n)
      }
    )
  ]

  ansible_inventory = templatefile(
    "${path.module}/templates/inventory/ansible_inventory.tpl",
    {
      all_hosts = join(
        "\n",
        concat(
          local.web_hosts.*,
          local.logs_hosts.*,
          local.metrics_hosts.*,
          local.wallet_node_hosts.*,
          local.seed_node_hosts.*,
          local.miner_hosts.*,
          local.masternode_hosts.*,
          local.vpn.*,
        ),
      )
      web_hosts         = join("\n", concat(aws_instance.web.*.tags.Hostname))
      logs_hosts        = join("\n", concat(aws_instance.logs.*.tags.Hostname))
      metrics_hosts     = join("\n", concat(aws_instance.metrics.*.tags.Hostname))
      wallet_node_hosts = join("\n", concat(aws_instance.dashd_wallet.*.tags.Hostname))
      miner_hosts       = join("\n", concat(aws_instance.miner.*.tags.Hostname))
      masternode_hosts  = join("\n", concat(aws_instance.masternode.*.tags.Hostname))
      seed_hosts        = join("\n", concat(aws_instance.seed_node.*.tags.Hostname))
    }
  )
}

output "ansible_inventory" {
  value = local.ansible_inventory
}
