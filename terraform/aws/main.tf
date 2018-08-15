# Specify the provider and access details
provider "aws" {
  region = "${var.aws_region}"
}

terraform {
  backend "s3" {
    bucket = "dash-networks-deploy-state"
    key = "terraform/state"
    region = "us-west-2"
    dynamodb_table = "dash-networks-deploy-terraform-lock"
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-xenial-16.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

# Create a VPC to launch our instances into
resource "aws_vpc" "default" {
  cidr_block = "${var.vpc_cidr}"
}

# Create an internet gateway to give our subnet access to the outside world
resource "aws_internet_gateway" "default" {
  vpc_id = "${aws_vpc.default.id}"
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
}

# A security group for the ELB so it is accessible via the web
resource "aws_security_group" "elb" {
  name        = "${terraform.workspace}-elb"
  vpc_id      = "${aws_vpc.default.id}"

  # HTTP access from anywhere
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # outbound internet access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "default" {
  name = "${terraform.workspace}-ssh"
  description = "dashd node"
  vpc_id = "${aws_vpc.default.id}"

  # SSH access from anywhere
  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # outbound internet access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# dashd nodes not accessible from the public internet
resource "aws_security_group" "dashd_private" {
  name        = "${terraform.workspace}-dashd-private"
  description = "dashd private node"
  vpc_id      = "${aws_vpc.default.id}"

  # Dash Core access
  ingress {
    from_port   = "${var.dashd_port}"
    to_port     = "${var.dashd_port}"
    protocol    = "tcp"
    cidr_blocks = ["${var.private_subnet}"]
  }

  # RPC access
  ingress {
    from_port   = "${var.dashd_rpc_port}"
    to_port     = "${var.dashd_rpc_port}"
    protocol    = "tcp"
    cidr_blocks = ["${var.private_subnet}"]
  }
}

# dashd node accessible from the public internet
resource "aws_security_group" "dashd" {
  name        = "${terraform.workspace}-dashd"
  description = "dashd node"
  vpc_id      = "${aws_vpc.default.id}"

  # Dash Core access
  ingress {
    from_port   = "${var.dashd_port}"
    to_port     = "${var.dashd_port}"
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # RPC access
  ingress {
    from_port   = "${var.dashd_rpc_port}"
    to_port     = "${var.dashd_rpc_port}"
    protocol    = "tcp"
    cidr_blocks = ["${var.private_subnet}"]
  }
}

resource "aws_security_group" "http" {
  name = "${terraform.workspace}-http"
  description = "dashd node"
  vpc_id = "${aws_vpc.default.id}"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["${var.private_subnet}"]
  }
}

resource "aws_elb" "web" {
  name = "${terraform.workspace}"

  subnets         = ["${aws_subnet.default.id}"]
  security_groups = ["${aws_security_group.elb.id}"]
  instances       = ["${aws_instance.web.id}"]

  listener {
    instance_port     = 80
    instance_protocol = "http"
    lb_port           = 80
    lb_protocol       = "http"
  }
}

resource "aws_key_pair" "auth" {
  key_name   = "${terraform.workspace}-${var.key_name}"
  public_key = "${file(var.public_key_path)}"
}

# web
resource "aws_instance" "web" {
  connection {
    user = "ubuntu"
  }

  ami = "${data.aws_ami.ubuntu.id}"
  instance_type = "t2.micro"
  key_name = "${aws_key_pair.auth.id}"

  vpc_security_group_ids = [
    "${aws_security_group.default.id}",
    "${aws_security_group.http.id}",
  ]
  subnet_id = "${aws_subnet.default.id}"

  tags = {
    Name = "${terraform.workspace}-web"
    Hostname = "web"
  }
}

# dashd wallet nodes (for faucet and masternode collaterals)
resource "aws_instance" "dashd_wallet" {
  count = "${var.wallet_count}"

  ami = "${data.aws_ami.ubuntu.id}"
  instance_type = "t2.micro"
  key_name = "${aws_key_pair.auth.id}"

  vpc_security_group_ids = [
    "${aws_security_group.default.id}",
    "${aws_security_group.dashd_private.id}",
  ]
  subnet_id = "${aws_subnet.default.id}"

  tags = {
    Name = "${terraform.workspace}-dashd-wallet-${count.index + 1}"
    Hostname = "dashd-wallet-${count.index + 1}"
  }
}

# dashd full nodes
resource "aws_instance" "dashd_full_node" {
  count = "${var.node_count}"

  ami = "${data.aws_ami.ubuntu.id}"
  instance_type = "t2.micro"
  key_name = "${aws_key_pair.auth.id}"

  vpc_security_group_ids = [
    "${aws_security_group.default.id}",
    "${aws_security_group.dashd.id}",
  ]
  subnet_id = "${aws_subnet.default.id}"

  tags = {
    Name = "${terraform.workspace}-node-${count.index + 1}"
    Hostname = "node-${count.index + 1}"
  }
}

# cpu miners (not running a node)
resource "aws_instance" "miner" {
  count = "${var.miner_count}"

  ami = "${data.aws_ami.ubuntu.id}"
  instance_type = "t2.small"
  key_name = "${aws_key_pair.auth.id}"

  vpc_security_group_ids = [
    "${aws_security_group.default.id}"
  ]
  subnet_id = "${aws_subnet.default.id}"

  tags = {
    Name = "${terraform.workspace}-miner-${count.index + 1}"
    Hostname = "miner-${count.index + 1}"
  }
}

# masternodes
resource "aws_instance" "masternode" {
  count = "${var.masternode_count}"

  ami = "${data.aws_ami.ubuntu.id}"
  instance_type = "t2.micro"
  key_name = "${aws_key_pair.auth.id}"

  vpc_security_group_ids = [
    "${aws_security_group.default.id}",
    "${aws_security_group.dashd.id}",
  ]
  subnet_id = "${aws_subnet.default.id}"

  tags = {
    Name = "${terraform.workspace}-masternode-${count.index + 1}"
    Hostname = "masternode-${count.index + 1}"
  }
}
