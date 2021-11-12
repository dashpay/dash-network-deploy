resource "aws_instance" "web" {
  count = var.web_count

  connection {
    host = coalesce(self.public_ip, self.private_ip)
    type = "ssh"
    user = "ubuntu"
  }

  ami                  = data.aws_ami.ubuntu.id
  instance_type        = "t3.small"
  key_name             = aws_key_pair.auth.id
  iam_instance_profile = aws_iam_instance_profile.monitoring.name

  root_block_device {
    volume_size = var.web_node_disk_size
  }

  vpc_security_group_ids = [
    aws_security_group.default.id,
    aws_security_group.http.id,
  ]

  subnet_id = element(aws_subnet.public.*.id, count.index)

  volume_tags = {
    Name        = "dn-${terraform.workspace}-web-${count.index + 1}"
    Hostname    = "web-${count.index + 1}"
    DashNetwork = terraform.workspace
  }

  tags = {
    Name        = "dn-${terraform.workspace}-web-${count.index + 1}"
    Hostname    = "web-${count.index + 1}"
    DashNetwork = terraform.workspace
  }

  lifecycle {
    ignore_changes = [ami]
  }
}

# dashd wallet nodes (for faucet and masternode collaterals)
resource "aws_instance" "dashd_wallet" {
  count = var.wallet_count

  ami                  = data.aws_ami.ubuntu.id
  instance_type        = "t3.micro"
  key_name             = aws_key_pair.auth.id
  iam_instance_profile = aws_iam_instance_profile.monitoring.name

  root_block_device {
    volume_size = var.core_node_disk_size
  }

  vpc_security_group_ids = [
    aws_security_group.default.id,
    aws_security_group.dashd_private.id,
  ]

  subnet_id = element(aws_subnet.public.*.id, count.index)

  volume_tags = {
    Name        = "dn-${terraform.workspace}-dashd-wallet-${count.index + 1}"
    Hostname    = "dashd-wallet-${count.index + 1}"
    DashNetwork = terraform.workspace
  }

  tags = {
    Name        = "dn-${terraform.workspace}-dashd-wallet-${count.index + 1}"
    Hostname    = "dashd-wallet-${count.index + 1}"
    DashNetwork = terraform.workspace
  }

  lifecycle {
    ignore_changes = [ami]
  }

}

# dashd full nodes
resource "aws_instance" "seed_node" {
  count = var.seed_count

  ami                  = data.aws_ami.ubuntu.id
  instance_type        = "t3.medium"
  key_name             = aws_key_pair.auth.id
  iam_instance_profile = aws_iam_instance_profile.monitoring.name

  vpc_security_group_ids = [
    aws_security_group.default.id,
    aws_security_group.dashd_public.id,
    aws_security_group.masternode.id,
  ]

  subnet_id = element(aws_subnet.public.*.id, count.index)

  root_block_device {
    volume_size = var.mn_node_disk_size
  }

  volume_tags = {
    Name        = "dn-${terraform.workspace}-seed-${count.index + 1}"
    Hostname    = "seed-${count.index + 1}"
    DashNetwork = terraform.workspace
  }

  tags = {
    Name        = "dn-${terraform.workspace}-seed-${count.index + 1}"
    Hostname    = "seed-${count.index + 1}"
    DashNetwork = terraform.workspace
  }

  lifecycle {
    ignore_changes = [ami]
  }

}

# cpu miners (not running a node)
resource "aws_instance" "miner" {
  count = var.miner_count

  ami                  = data.aws_ami.ubuntu.id
  instance_type        = "t3.small"
  key_name             = aws_key_pair.auth.id
  iam_instance_profile = aws_iam_instance_profile.monitoring.name

  root_block_device {
    volume_size = var.core_node_disk_size
  }

  vpc_security_group_ids = [
    aws_security_group.default.id,
    aws_security_group.dashd_private.id,
  ]

  subnet_id = element(aws_subnet.public.*.id, count.index)

  volume_tags = {
    Name        = "dn-${terraform.workspace}-miner-${count.index + 1}"
    Hostname    = "miner-${count.index + 1}"
    DashNetwork = terraform.workspace
  }

  tags = {
    Name        = "dn-${terraform.workspace}-miner-${count.index + 1}"
    Hostname    = "miner-${count.index + 1}"
    DashNetwork = terraform.workspace
  }

  lifecycle {
    ignore_changes = [ami]
  }

}

# masternodes
resource "aws_instance" "masternode" {
  count = var.masternode_count

  ami                  = data.aws_ami.ubuntu.id
  instance_type        = "t3.medium"
  key_name             = aws_key_pair.auth.id
  iam_instance_profile = aws_iam_instance_profile.monitoring.name

  vpc_security_group_ids = [
    aws_security_group.default.id,
    aws_security_group.dashd_public.id,
    aws_security_group.masternode.id,
  ]

  subnet_id = element(aws_subnet.public.*.id, count.index)

  root_block_device {
    volume_size = var.mn_node_disk_size
  }

  volume_tags = {
    Name        = "dn-${terraform.workspace}-masternode-${count.index + 1}"
    Hostname    = "masternode-${count.index + 1}"
    DashNetwork = terraform.workspace
  }

  tags = {
    Name        = "dn-${terraform.workspace}-masternode-${count.index + 1}"
    Hostname    = "masternode-${count.index + 1}"
    DashNetwork = terraform.workspace
  }

  lifecycle {
    ignore_changes = [ami]
  }

}

resource "aws_instance" "vpn" {
  count = var.vpn_enabled ? 1 : 0

  ami                  = data.aws_ami.ubuntu.id
  instance_type        = "t3.nano"
  key_name             = aws_key_pair.auth.id
  iam_instance_profile = aws_iam_instance_profile.monitoring.name

  subnet_id = element(aws_subnet.public.*.id, count.index)

  vpc_security_group_ids = [
    aws_security_group.vpn[0].id,
  ]

  volume_tags = {
    Name        = "dh-${terraform.workspace}-vpn"
    Hostname    = "vpn"
    DashNetwork = terraform.workspace
  }

  tags = {
    Name        = "dh-${terraform.workspace}-vpn"
    Hostname    = "vpn"
    DashNetwork = terraform.workspace
  }

  lifecycle {
    ignore_changes = [ami]
  }

}

resource "aws_instance" "logs" {
  count = var.logs_count

  ami                  = data.aws_ami.ubuntu.id
  instance_type        = var.logs_node_instance_type
  key_name             = aws_key_pair.auth.id
  iam_instance_profile = aws_iam_instance_profile.monitoring.name

  root_block_device {
    volume_size = var.logs_node_disk_size
  }

  subnet_id = element(aws_subnet.public.*.id, count.index)

  vpc_security_group_ids = [
    aws_security_group.default.id,
    aws_security_group.logs.id,
  ]

  volume_tags = {
    Name        = "dn-${terraform.workspace}-logs-${count.index + 1}"
    Hostname    = "logs-${count.index + 1}"
    DashNetwork = terraform.workspace
  }

  tags = {
    Name        = "dn-${terraform.workspace}-logs-${count.index + 1}"
    Hostname    = "logs-${count.index + 1}"
    DashNetwork = terraform.workspace
  }

  lifecycle {
    ignore_changes = [ami]
  }

}
