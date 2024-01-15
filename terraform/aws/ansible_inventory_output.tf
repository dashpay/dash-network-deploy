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

    mixer_hosts = [
    for n in range(length(aws_instance.mixer)) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.mixer.*.tags.Hostname, n)
        public_ip  = element(aws_instance.mixer.*.public_ip, n)
        private_ip = element(aws_instance.mixer.*.private_ip, n)
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

  load_test_hosts = [
    for n in range(length(aws_instance.load_test)) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.load_test.*.tags.Hostname, n)
        public_ip  = element(aws_instance.load_test.*.public_ip, n)
        private_ip = element(aws_instance.load_test.*.private_ip, n)
      }
    )
  ]

  prometheus_hosts = [
    for n in range(length(aws_instance.prometheus)) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.prometheus.*.tags.Hostname, n)
        public_ip  = element(aws_instance.prometheus.*.public_ip, n)
        private_ip = element(aws_instance.prometheus.*.private_ip, n)
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

  masternode_amd_hosts = [
    for n in range(length(aws_instance.masternode_amd)) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.masternode_amd.*.tags.Hostname, n)
        public_ip  = element(aws_instance.masternode_amd.*.public_ip, n)
        private_ip = element(aws_instance.masternode_amd.*.private_ip, n)
      }
    )
  ]

  masternode_arm_hosts = [
    for n in range(length(aws_instance.masternode_arm)) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.masternode_arm.*.tags.Hostname, n)
        public_ip  = element(aws_instance.masternode_arm.*.public_ip, n)
        private_ip = element(aws_instance.masternode_arm.*.private_ip, n)
      }
    )
  ]

  masternode_hosts = concat(local.masternode_amd_hosts, local.masternode_arm_hosts)

  hp_masternode_amd_hosts = [
    for n in range(length(aws_instance.hp_masternode_amd)) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.hp_masternode_amd.*.tags.Hostname, n)
        public_ip = var.create_eip ? element(aws_eip.hpmn_amd_eip.*.public_ip, n) : element(aws_instance.hp_masternode_amd.*.public_ip, n)
        private_ip = element(aws_instance.hp_masternode_amd.*.private_ip, n)
      }
    )
  ]

  hp_masternode_arm_hosts = [
    for n in range(length(aws_instance.hp_masternode_arm)) : templatefile(
      "${path.module}/templates/inventory/hostname.tpl",
      {
        index      = n + 1
        name       = element(aws_instance.hp_masternode_arm.*.tags.Hostname, n)
        public_ip  = var.create_eip ? element(aws_eip.hpmn_arm_eip.*.public_ip, n) : element(aws_instance.hp_masternode_arm.*.public_ip, n)
        private_ip = element(aws_instance.hp_masternode_arm.*.private_ip, n)
      }
    )
  ]

  hp_masternode_hosts = concat(local.hp_masternode_amd_hosts, local.hp_masternode_arm_hosts)

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
          local.wallet_node_hosts.*,
          local.mixer_hosts.*,
          local.seed_node_hosts.*,
          local.miner_hosts.*,
          local.masternode_hosts.*,
          local.hp_masternode_hosts.*,
          local.vpn.*,
          local.load_test_hosts.*,
          local.prometheus_hosts.*,
        ),
      )
      web_hosts           = join("\n", concat(aws_instance.web.*.tags.Hostname))
      logs_hosts          = join("\n", concat(aws_instance.logs.*.tags.Hostname))
      wallet_node_hosts   = join("\n", concat(aws_instance.dashd_wallet.*.tags.Hostname))
      mixer_hosts         = join("\n", concat(aws_instance.mixer.*.tags.Hostname))
      miner_hosts         = join("\n", concat(aws_instance.miner.*.tags.Hostname))
      masternode_hosts    = join("\n", concat(aws_instance.masternode_amd.*.tags.Hostname), concat(aws_instance.masternode_arm.*.tags.Hostname))
      hp_masternode_hosts = join("\n", concat(aws_instance.hp_masternode_amd.*.tags.Hostname), concat(aws_instance.hp_masternode_arm.*.tags.Hostname))
      seed_hosts          = join("\n", concat(aws_instance.seed_node.*.tags.Hostname))
      load_test_hosts     = join("\n", concat(aws_instance.load_test.*.tags.Hostname))
      prometheus_hosts     = join("\n", concat(aws_instance.prometheus.*.tags.Hostname))
    }
  )
}

output "ansible_inventory" {
  value = local.ansible_inventory
}
