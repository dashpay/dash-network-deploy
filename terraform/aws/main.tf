# Specify the provider and access details
provider "aws" {
}

terraform {
  backend "s3" {
  }
}

data "aws_availability_zones" "available" {
  blacklisted_names = ["us-west-2d"]
  state             = "available"
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name = "name"

    values = [
      "ubuntu/images/hvm-ssd/ubuntu-*-18.04-amd64-server-*",
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
  cidr_block = var.vpc_cidr

  tags = {
    Name        = "dn-${terraform.workspace}"
    DashNetwork = terraform.workspace
  }
}

# Create an internet gateway to give our subnets access to the outside world
resource "aws_internet_gateway" "default" {
  vpc_id = aws_vpc.default.id

  tags = {
    Name        = "dn-${terraform.workspace}"
    DashNetwork = terraform.workspace
  }
}

# Grant the VPC internet access on its main route table
resource "aws_route" "internet_access" {
  route_table_id         = aws_vpc.default.main_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.default.id
}

# Create subnets to launch our instances into
resource "aws_subnet" "public" {
  count                   = 3
  vpc_id                  = aws_vpc.default.id
  cidr_block              = var.subnet_public_cidr[count.index]
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  tags = {
    Name        = "${terraform.workspace}-public${count.index}"
    DashNetwork = terraform.workspace
    Tier        = "Public"
  }
}

locals {
  public_network_name = replace(terraform.workspace, "devnet-", "")
}

data "aws_route53_zone" "main_domain" {
  name = var.main_domain
}

resource "aws_elb" "web" {
  name = local.public_network_name

  subnets = aws_subnet.public.*.id

  security_groups = [
    aws_security_group.elb.id,
  ]

  instances = [
    aws_instance.web[0].id,
  ]

  listener {
    instance_port     = 80
    instance_protocol = "http"
    lb_port           = 80
    lb_protocol       = "http"
  }

  listener {
    instance_port     = var.insight_port
    instance_protocol = "http"
    lb_port           = var.insight_port
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
    DashNetwork = terraform.workspace
  }
}

resource "aws_route53_record" "faucet" {
  zone_id = data.aws_route53_zone.main_domain.zone_id
  name    = "faucet.${local.public_network_name}.${var.main_domain}"
  type    = "CNAME"
  ttl     = "300"
  records = [aws_elb.web.dns_name]

  count = length(var.main_domain) > 1 ? 1 : 0
}

resource "aws_route53_record" "insight" {
  zone_id = data.aws_route53_zone.main_domain.zone_id
  name    = "insight.${local.public_network_name}.${var.main_domain}"
  type    = "CNAME"
  ttl     = "300"
  records = [aws_elb.web.dns_name]

  count = length(var.main_domain) > 1 ? 1 : 0
}

resource "aws_route53_record" "masternodes" {
  zone_id = data.aws_route53_zone.main_domain.zone_id
  name    = "seed.${local.public_network_name}.${var.main_domain}"
  type    = "A"
  ttl     = "300"
  records = concat(aws_instance.masternode.*.public_ip)

  count = length(var.main_domain) > 1 ? 1 : 0
}

resource "aws_key_pair" "auth" {
  key_name   = "dn-${terraform.workspace}-auth"
  public_key = file(var.public_key_path)
}

resource "aws_eip" "vpn" {
  instance = aws_instance.vpn[0].id

  tags = {
    Name        = "dn-${terraform.workspace}-vpn"
    DashNetwork = terraform.workspace
  }
}

