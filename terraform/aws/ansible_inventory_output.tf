data "template_file" "web_hosts" {
  count    = length(aws_instance.web)
  template = file("${path.module}/templates/inventory/hostname.tpl")

  vars = {
    index      = count.index + 1
    name       = element(aws_instance.web.*.tags.Hostname, count.index)
    public_ip  = element(aws_instance.web.*.public_ip, count.index)
    private_ip = element(aws_instance.web.*.private_ip, count.index)
  }
}

data "template_file" "logs_hosts" {
  count    = length(aws_instance.logs)
  template = file("${path.module}/templates/inventory/hostname.tpl")

  vars = {
    index      = count.index + 1
    name       = element(aws_instance.logs.*.tags.Hostname, count.index)
    public_ip  = element(aws_instance.logs.*.public_ip, count.index)
    private_ip = element(aws_instance.logs.*.private_ip, count.index)
  }
}

data "template_file" "wallet_node_hosts" {
  count    = length(aws_instance.dashd_wallet)
  template = file("${path.module}/templates/inventory/hostname.tpl")

  vars = {
    index      = count.index + 1
    name       = element(aws_instance.dashd_wallet.*.tags.Hostname, count.index)
    public_ip  = element(aws_instance.dashd_wallet.*.public_ip, count.index)
    private_ip = element(aws_instance.dashd_wallet.*.private_ip, count.index)
  }
}

data "template_file" "seed_node_hosts" {
  count    = length(aws_instance.seed_node)
  template = file("${path.module}/templates/inventory/hostname.tpl")

  vars = {
    index      = count.index + 1
    name       = element(aws_instance.seed_node.*.tags.Hostname, count.index)
    public_ip  = element(aws_instance.seed_node.*.public_ip, count.index)
    private_ip = element(aws_instance.seed_node.*.private_ip, count.index)
  }
}

data "template_file" "miner_hosts" {
  count    = length(aws_instance.miner)
  template = file("${path.module}/templates/inventory/hostname.tpl")

  vars = {
    index      = count.index + 1
    name       = element(aws_instance.miner.*.tags.Hostname, count.index)
    public_ip  = element(aws_instance.miner.*.public_ip, count.index)
    private_ip = element(aws_instance.miner.*.private_ip, count.index)
  }
}

data "template_file" "masternode_hosts" {
  count    = length(aws_instance.masternode)
  template = file("${path.module}/templates/inventory/hostname.tpl")

  vars = {
    index      = count.index + 1
    name       = element(aws_instance.masternode.*.tags.Hostname, count.index)
    public_ip  = element(aws_instance.masternode.*.public_ip, count.index)
    private_ip = element(aws_instance.masternode.*.private_ip, count.index)
  }
}

data "template_file" "vpn" {
  count    = var.vpn_enabled ? 1 : 0
  template = file("${path.module}/templates/inventory/hostname.tpl")

  vars = {
    index      = count.index + 1
    name       = element(aws_instance.vpn.*.tags.Hostname, count.index)
    public_ip  = element(aws_eip.vpn.*.public_ip, count.index)
    private_ip = element(aws_instance.vpn.*.private_ip, count.index)
  }
}

data "template_file" "ansible_inventory" {
  template = file("${path.module}/templates/inventory/ansible_inventory.tpl")

  vars = {
    all_hosts = join(
      "\n",
      concat(
        data.template_file.web_hosts.*.rendered,
        data.template_file.logs_hosts.*.rendered,
        data.template_file.wallet_node_hosts.*.rendered,
        data.template_file.seed_node_hosts.*.rendered,
        data.template_file.miner_hosts.*.rendered,
        data.template_file.masternode_hosts.*.rendered,
        data.template_file.vpn.*.rendered,
      ),
    )
    web_hosts         = join("\n", concat(aws_instance.web.*.tags.Hostname))
    logs_hosts        = join("\n", concat(aws_instance.logs.*.tags.Hostname))
    wallet_node_hosts = join("\n", concat(aws_instance.dashd_wallet.*.tags.Hostname))
    miner_hosts       = join("\n", concat(aws_instance.miner.*.tags.Hostname))
    masternode_hosts  = join("\n", concat(aws_instance.masternode.*.tags.Hostname))
    seed_hosts        = join("\n", concat(aws_instance.seed_node.*.tags.Hostname))
  }
}

output "ansible_inventory" {
  value = data.template_file.ansible_inventory.rendered
}

