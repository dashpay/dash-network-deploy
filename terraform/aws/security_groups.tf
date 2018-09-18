resource "aws_security_group" "default" {
  name        = "${terraform.workspace}-ssh"
  description = "ssh access"
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

  # Docker API
  ingress {
    from_port = 2375
    to_port   = 2375
    protocol  = "tcp"

    cidr_blocks = [
      "${var.private_subnet}",
      "${aws_eip.vpn.public_ip}/32",
    ]
  }

  # outbound internet access
  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"

    cidr_blocks = [
      "0.0.0.0/0",
      "${var.private_subnet}",
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
      "${var.private_subnet}",
      "${aws_eip.vpn.public_ip}/32",
    ]
  }

  # DashCore ZMQ acess
  ingress {
    from_port = "${var.dashd_zmq_port}"
    to_port   = "${var.dashd_zmq_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "${var.private_subnet}",
      "${aws_eip.vpn.public_ip}/32",
    ]
  }

  tags = {
    Name        = "dn-${terraform.workspace}-dashd-private"
    DashNetwork = "${terraform.workspace}"
  }
}

# dashd node accessible from the public internet
resource "aws_security_group" "dashd_public" {
  name        = "${terraform.workspace}-dashd-public"
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
      "${var.private_subnet}",
      "${aws_eip.vpn.public_ip}/32",
    ]
  }

  # DashCore ZMQ acess
  ingress {
    from_port = "${var.dashd_zmq_port}"
    to_port   = "${var.dashd_zmq_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "${var.private_subnet}",
      "${aws_eip.vpn.public_ip}/32",
    ]
  }

  tags = {
    Name        = "dn-${terraform.workspace}-dashd-public"
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
      "${aws_eip.vpn.public_ip}/32",
    ]
  }

  ingress {
    from_port = 3001
    to_port   = 3001
    protocol  = "tcp"

    cidr_blocks = [
      "${var.private_subnet}",
      "${aws_eip.vpn.public_ip}/32",
    ]
  }

  tags = {
    Name        = "dn-${terraform.workspace}-http"
    DashNetwork = "${terraform.workspace}"
  }
}

# dashd node accessible from the public internet
resource "aws_security_group" "masternode" {
  name        = "${terraform.workspace}-masternode"
  description = "masternode"
  vpc_id      = "${aws_vpc.default.id}"

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
      "${var.private_subnet}",
      "${aws_eip.vpn.public_ip}/32",
    ]
  }

  # Insight API access
  ingress {
    from_port = "${var.insight_port}"
    to_port   = "${var.insight_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "${var.private_subnet}",
      "${aws_eip.vpn.public_ip}/32",
    ]
  }

  # Drive
  ingress {
    from_port = "${var.drive_port}"
    to_port   = "${var.drive_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "${var.private_subnet}",
      "${aws_eip.vpn.public_ip}/32",
    ]
  }

  # DAPI
  ingress {
    from_port = "${var.dapi_port}"
    to_port   = "${var.dapi_port}"
    protocol  = "tcp"

    cidr_blocks = [
      "${var.private_subnet}",
      "${aws_eip.vpn.public_ip}/32",
    ]
  }

  tags = {
    Name        = "dn-${terraform.workspace}-masternode"
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

resource "aws_security_group" "vpn" {
  count = "${var.vpn_enabled ? 1 : 0}"

  name        = "${terraform.workspace}-vpn"
  description = "vpn client access"
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

  # VPN Client
  ingress {
    from_port = 1194
    to_port   = 1194
    protocol  = "udp"

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
      "${var.private_subnet}",
    ]
  }

  tags = {
    Name        = "dn-${terraform.workspace}-vpn"
    DashNetwork = "${terraform.workspace}"
  }
}
