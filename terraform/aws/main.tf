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

  health_check {
    healthy_threshold   = 2
    interval            = 20
    target              = "HTTP:80/"
    timeout             = 3
    unhealthy_threshold = 2
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

resource "aws_eip" "vpn" {
  instance = "${aws_instance.vpn.id}"

  tags = {
    Name        = "dn-${terraform.workspace}-vpn"
    DashNetwork = "${terraform.workspace}"
  }
}
