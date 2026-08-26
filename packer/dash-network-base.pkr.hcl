packer {
  required_plugins {
    amazon = {
      version = ">= 1.3.0"
      source  = "github.com/hashicorp/amazon"
    }
    ansible = {
      version = ">= 1.1.0"
      source  = "github.com/hashicorp/ansible"
    }
  }
}

variable "region" {
  type    = string
  default = "us-west-2"
}


variable "ami_prefix" {
  type    = string
  default = "dash-network-base"
}

variable "instance_type_amd64" {
  type    = string
  default = "t3.small"
}

variable "instance_type_arm64" {
  type    = string
  default = "t4g.small"
}

locals {
  timestamp = regex_replace(timestamp(), "[- TZ:]", "")
}

source "amazon-ebs" "ubuntu_jammy_amd64" {
  region          = var.region
  instance_type   = var.instance_type_amd64
  ssh_username    = "ubuntu"
  ami_name        = "${var.ami_prefix}-amd64-${local.timestamp}"
  ami_description = "Dash Network Deploy common base image for amd64"

  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    owners      = ["099720109477"]
    most_recent = true
  }

  tags = {
    Name         = "${var.ami_prefix}-amd64"
    Project      = "dash-network-deploy"
    Architecture = "amd64"
  }
}

source "amazon-ebs" "ubuntu_jammy_arm64" {
  region          = var.region
  instance_type   = var.instance_type_arm64
  ssh_username    = "ubuntu"
  ami_name        = "${var.ami_prefix}-arm64-${local.timestamp}"
  ami_description = "Dash Network Deploy common base image for arm64"

  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-arm64-server*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    owners      = ["099720109477"]
    most_recent = true
  }

  tags = {
    Name         = "${var.ami_prefix}-arm64"
    Project      = "dash-network-deploy"
    Architecture = "arm64"
  }
}

build {
  name = "dash-network-base"
  sources = [
    "source.amazon-ebs.ubuntu_jammy_amd64",
    "source.amazon-ebs.ubuntu_jammy_arm64",
  ]

  provisioner "ansible" {
    playbook_file = "ansible/prebake-common.yml"
    galaxy_file   = "ansible/requirements.yml"
    user          = "ubuntu"
    use_proxy     = false
    ansible_env_vars = [
      "ANSIBLE_HOST_KEY_CHECKING=False",
      "ANSIBLE_BECOME_TIMEOUT=60",
      "ANSIBLE_TIMEOUT=60",
    ]
    extra_arguments = [
      "--extra-vars",
      "ansible_become_timeout=60 ansible_ssh_timeout=60",
    ]
  }
}
