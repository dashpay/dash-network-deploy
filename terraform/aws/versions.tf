
terraform {
  required_version = "~> 1.12.1"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.21"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5.1"
    }
  }
}
