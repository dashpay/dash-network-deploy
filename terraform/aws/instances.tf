resource "aws_instance" "web" {
  count = "${var.web_count}"

  connection {
    user = "ubuntu"
  }

  ami           = "${data.aws_ami.ubuntu.id}"
  instance_type = "t2.micro"
  key_name      = "${aws_key_pair.auth.id}"

  vpc_security_group_ids = [
    "${aws_security_group.default.id}",
    "${aws_security_group.http.id}",
  ]

  subnet_id = "${aws_subnet.default.id}"

  credit_specification {
    cpu_credits = "unlimited"
  }

  tags = {
    Name        = "dn-${terraform.workspace}-web-${count.index + 1}"
    Hostname    = "web-${count.index + 1}"
    DashNetwork = "${terraform.workspace}"
  }
}

# dashd wallet nodes (for faucet and masternode collaterals)
resource "aws_instance" "dashd_wallet" {
  count = "${var.wallet_count}"

  ami           = "${data.aws_ami.ubuntu.id}"
  instance_type = "t2.micro"
  key_name      = "${aws_key_pair.auth.id}"

  vpc_security_group_ids = [
    "${aws_security_group.default.id}",
    "${aws_security_group.dashd_private.id}",
  ]

  subnet_id = "${aws_subnet.default.id}"

  credit_specification {
    cpu_credits = "unlimited"
  }

  tags = {
    Name        = "dn-${terraform.workspace}-dashd-wallet-${count.index + 1}"
    Hostname    = "dashd-wallet-${count.index + 1}"
    DashNetwork = "${terraform.workspace}"
  }
}

# dashd full nodes
resource "aws_instance" "dashd_full_node" {
  count = "${var.node_count}"

  ami           = "${data.aws_ami.ubuntu.id}"
  instance_type = "t2.micro"
  key_name      = "${aws_key_pair.auth.id}"

  vpc_security_group_ids = [
    "${aws_security_group.default.id}",
    "${aws_security_group.dashd_public.id}",
  ]

  subnet_id = "${aws_subnet.default.id}"

  credit_specification {
    cpu_credits = "unlimited"
  }

  tags = {
    Name        = "dn-${terraform.workspace}-node-${count.index + 1}"
    Hostname    = "node-${count.index + 1}"
    DashNetwork = "${terraform.workspace}"
  }
}

# cpu miners (not running a node)
resource "aws_instance" "miner" {
  count = "${var.miner_count}"

  ami           = "${data.aws_ami.ubuntu.id}"
  instance_type = "t2.small"
  key_name      = "${aws_key_pair.auth.id}"

  vpc_security_group_ids = [
    "${aws_security_group.default.id}",
    "${aws_security_group.dashd_private.id}",
  ]

  subnet_id = "${aws_subnet.default.id}"

  credit_specification {
    cpu_credits = "unlimited"
  }

  tags = {
    Name        = "dn-${terraform.workspace}-miner-${count.index + 1}"
    Hostname    = "miner-${count.index + 1}"
    DashNetwork = "${terraform.workspace}"
  }
}

# masternodes
resource "aws_instance" "masternode" {
  count = "${var.masternode_count}"

  ami           = "${data.aws_ami.ubuntu.id}"
  instance_type = "t2.small"
  key_name      = "${aws_key_pair.auth.id}"

  vpc_security_group_ids = [
    "${aws_security_group.default.id}",
    "${aws_security_group.dashd_public.id}",
    "${aws_security_group.masternode.id}",
  ]

  subnet_id = "${aws_subnet.default.id}"

  credit_specification {
    cpu_credits = "unlimited"
  }

  root_block_device {
    volume_size = "14"
  }

  tags = {
    Name        = "dn-${terraform.workspace}-masternode-${count.index + 1}"
    Hostname    = "masternode-${count.index + 1}"
    DashNetwork = "${terraform.workspace}"
  }
}

resource "aws_instance" "vpn" {
  count = "${var.vpn_enabled ? 1 : 0}"

  ami           = "${data.aws_ami.ubuntu.id}"
  instance_type = "t3.nano"
  key_name      = "${aws_key_pair.auth.id}"

  subnet_id = "${aws_subnet.default.id}"

  credit_specification {
    cpu_credits = "unlimited"
  }

  vpc_security_group_ids = [
    "${aws_security_group.vpn.id}",
  ]

  tags {
    Name        = "dh-${terraform.workspace}-vpn"
    Hostname    = "vpn"
    DashNetwork = "${terraform.workspace}"
  }
}
