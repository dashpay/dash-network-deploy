# Specify the provider and access details
provider "aws" {}

terraform {
  backend "s3" {}
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name = "name"

    values = [
      "ubuntu/images/hvm-ssd/ubuntu-xenial-16.04-amd64-server-*",
    ]
  }

  filter {
    name = "virtualization-type"

    values = [
      "hvm",
    ]
  }

  owners = [
    "099720109477",
  ]

  # Canonical
}

# Create a VPC to launch our instances into
resource "aws_vpc" "default" {
  cidr_block = "${var.vpc_cidr}"

  tags = {
    Name        = "dn-${terraform.workspace}"
    DashNetwork = "${terraform.workspace}"
  }
}

# Create an internet gateway to give our subnet access to the outside world
resource "aws_internet_gateway" "default" {
  vpc_id = "${aws_vpc.default.id}"

  tags = {
    Name        = "dn-${terraform.workspace}"
    DashNetwork = "${terraform.workspace}"
  }
}

# Grant the VPC internet access on its main route table
resource "aws_route" "internet_access" {
  route_table_id         = "${aws_vpc.default.main_route_table_id}"
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = "${aws_internet_gateway.default.id}"
}

# Create a subnet to launch our instances into
resource "aws_subnet" "default" {
  vpc_id                  = "${aws_vpc.default.id}"
  cidr_block              = "${var.private_subnet}"
  map_public_ip_on_launch = true

  tags = {
    Name        = "dn-${terraform.workspace}-default"
    DashNetwork = "${terraform.workspace}"
  }
}

# A security group for the ELB so it is accessible via the web
resource "aws_security_group" "elb" {
  name   = "${terraform.workspace}-elb"
  vpc_id = "${aws_vpc.default.id}"

  # HTTP access from anywhere
  ingress {
    from_port = 80
    to_port   = 80
    protocol  = "tcp"

    cidr_blocks = [
      "0.0.0.0/0",
    ]
  }

  # Insight
  ingress {
    from_port = 3001
    to_port   = 3001
    protocol  = "tcp"

    cidr_blocks = [
      "0.0.0.0/0",
    ]
  }

  # outbound internet access
  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"

    cidr_blocks = [
      "0.0.0.0/0",
    ]
  }

  tags = {
    Name        = "dn-${terraform.workspace}-elb"
    DashNetwork = "${terraform.workspace}"
  }
}

resource "aws_security_group" "default" {
  name        = "${terraform.workspace}-ssh"
  description = "all nodes"
  vpc_id      = "${aws_vpc.default.id}"

  # SSH access from anywhere
  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"

    cidr_blocks = [
      "0.0.0.0/0",
    ]
  }

  # outbound internet access
  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"

    cidr_blocks = [
      "0.0.0.0/0",
    ]
  }

  tags = {
    Name        = "dn-${terraform.workspace}-default"
    DashNetwork = "${terraform.workspace}"
  }
}

# dashd nodes not accessible from the public internet
resource "aws_security_group" "dashd_private" {
  name        = "${terraform.workspace}-dashd-private"
  description = "dashd private node"
  vpc_id      = "${aws_vpc.default.id}"

  # Dash Core access
  ingress {
    from_port = "${var.dashd_port}"
    to_port   = "${var.dashd_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "${var.private_subnet}",
    ]
  }

  # DashCore RPC access
  ingress {
    from_port = "${var.dashd_rpc_port}"
    to_port   = "${var.dashd_rpc_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "0.0.0.0/0", //"${var.private_subnet}",
    ]
  }

  # DashCore ZMQ acess
  ingress {
    from_port = "${var.dashd_zmq_port}"
    to_port   = "${var.dashd_zmq_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "${var.private_subnet}",
    ]
  }

  tags = {
    Name        = "dn-${terraform.workspace}-dashd-private"
    DashNetwork = "${terraform.workspace}"
  }
}

# dashd node accessible from the public internet
resource "aws_security_group" "dashd" {
  name        = "${terraform.workspace}-dashd"
  description = "dashd public network"
  vpc_id      = "${aws_vpc.default.id}"

  # Dash Core access
  ingress {
    from_port = "${var.dashd_port}"
    to_port   = "${var.dashd_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "0.0.0.0/0",
    ]
  }

  # DashCore RPC access
  ingress {
    from_port = "${var.dashd_rpc_port}"
    to_port   = "${var.dashd_rpc_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "0.0.0.0/0", // "${var.private_subnet}",
    ]
  }

  # DashCore ZMQ acess
  ingress {
    from_port = "${var.dashd_zmq_port}"
    to_port   = "${var.dashd_zmq_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "${var.private_subnet}",
    ]
  }

  # IPFS swarm
  ingress {
    from_port = "${var.ipfs_swarm_port}"
    to_port   = "${var.ipfs_swarm_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "${var.private_subnet}",
    ]
  }

  # IPFS API
  ingress {
    from_port = "${var.ipfs_api_port}"
    to_port   = "${var.ipfs_api_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "0.0.0.0/0", //"${var.private_subnet}",
    ]
  }

  # Insight API access
  ingress {
    from_port = "${var.insight_port}"
    to_port   = "${var.insight_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "0.0.0.0/0", //"${var.private_subnet}",
    ]
  }

  # Drive
  ingress {
    from_port = "${var.drive_port}"
    to_port   = "${var.drive_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "0.0.0.0/0", //"${var.private_subnet}",
    ]
  }

  # DAPI
  ingress {
    from_port = "${var.dapi_port}"
    to_port   = "${var.dapi_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "0.0.0.0/0", //"${var.private_subnet}",
    ]
  }

  tags = {
    Name        = "dn-${terraform.workspace}-dashd"
    DashNetwork = "${terraform.workspace}"
  }
}

resource "aws_security_group" "http" {
  name        = "${terraform.workspace}-http"
  description = "web node"
  vpc_id      = "${aws_vpc.default.id}"

  ingress {
    from_port = 80
    to_port   = 80
    protocol  = "tcp"

    cidr_blocks = [
      "${var.private_subnet}",
    ]
  }

  ingress {
    from_port = 3001
    to_port   = 3001
    protocol  = "tcp"

    cidr_blocks = [
      "${var.private_subnet}",
    ]
  }

  tags = {
    Name        = "dn-${terraform.workspace}-http"
    DashNetwork = "${terraform.workspace}"
  }
}

resource "aws_elb" "web" {
  name = "${terraform.workspace}"

  subnets = [
    "${aws_subnet.default.id}",
  ]

  security_groups = [
    "${aws_security_group.elb.id}",
  ]

  instances = [
    "${aws_instance.web.id}",
  ]

  listener {
    instance_port     = 80
    instance_protocol = "http"
    lb_port           = 80
    lb_protocol       = "http"
  }

  listener {
    instance_port     = 3001
    instance_protocol = "http"
    lb_port           = 3001
    lb_protocol       = "http"
  }

  tags = {
    Name        = "dn-${terraform.workspace}-web"
    DashNetwork = "${terraform.workspace}"
  }
}

resource "aws_key_pair" "auth" {
  key_name   = "dn-${terraform.workspace}-auth"
  public_key = "${file(var.public_key_path)}"
}

# web
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
    "${aws_security_group.dashd.id}",
  ]

  subnet_id = "${aws_subnet.default.id}"

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
  ]

  subnet_id = "${aws_subnet.default.id}"

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
  instance_type = "t2.micro"
  key_name      = "${aws_key_pair.auth.id}"

  vpc_security_group_ids = [
    "${aws_security_group.default.id}",
    "${aws_security_group.dashd.id}",
  ]

  subnet_id = "${aws_subnet.default.id}"

  tags = {
    Name        = "dn-${terraform.workspace}-masternode-${count.index + 1}"
    Hostname    = "masternode-${count.index + 1}"
    DashNetwork = "${terraform.workspace}"
  }
}
