variable "public_key_path" {
  default = "~/.ssh/id_rsa.pub"
}

variable "key_name" {
  description = "Desired name of AWS key pair"
  default = "dash_cluster_key"
}

variable "aws_region" {
  description = "AWS region to launch servers."
  default     = "eu-west-1"
}

variable "dash_network" {
  description = "Dash network to create or connect to (mainnet/testnet/devnet/regtest)"
}

variable "dash_devnet_name" {
  description = "Dash devnet name"
}

variable "dashd_port" {
  description = "Port for Dash Core nodes"
}

variable "dashd_rpc_port" {
  description = "Port for Dash RPC interface"
}

variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "private_subnet" {
  default = "10.0.0.0/16"
}

variable "node_count" {
  default = 1
}

variable "miner_count" {
  default = 1
}

variable "masternode_count" {
  default = 1
}

variable "wallet_count" {
  description = "number of wallet nodes to create. must be at least 2"
  default = 2
}
