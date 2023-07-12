# Dash Network Deployment Tool

[![Latest Release](https://img.shields.io/github/v/release/dashevo/dash-network-deploy)](https://github.com/dashevo/dash-network-deploy/releases/latest)
[![Build Status](https://github.com/dashevo/dash-network-deploy/actions/workflows/release.yml/badge.svg)](https://github.com/dashevo/dash-network-deploy/actions/workflows/release.yml)
[![Release Date](https://img.shields.io/github/release-date/dashevo/dash-network-deploy)](https://img.shields.io/github/release-date/dashevo/dash-network-deploy)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen)](https://github.com/RichardLitt/standard-readme)

## Introduction

This tool assists in deploying and managing Dash networks.

There are two regular available networks: `testnet` and `mainnet`.
After deployment your DashCore instances will join those networks.

`regtest` and `devnet-*` networks are for testing purposes.
Devnets are like regular Dash networks (`mainnet` and `testnet`)
but easier to bootstrap and with unique names. This supports maintaining multiple in parallel.

This is work in progress and in its initial state only meant to be used by
Dash Core developers to assist in Dash Platform development.

## Installation

1. [Install Docker](https://docs.docker.com/install/)
2. Download tool:

    Using `wget`:

    ```bash
    wget -P /usr/local/bin https://raw.github.com/dashpay/dash-network-deploy/master/bin/dash-network && \
    chmod +x /usr/local/bin/dash-network
    ```

    Using `curl`:

    ```bash
    curl -fsSL -o /usr/local/bin/dash-network https://raw.github.com/dashpay/dash-network-deploy/master/bin/dash-network && \
    chmod +x /usr/local/bin/dash-network
    ```


## Configuration

### Networks definition

You can use the `generate` command to generate configs for your network:

```bash
dash-network generate <network_name> <masternodes_amd_count> <masternodes_arm_count> <hp_masternodes_amd_count> <hp_masternodes_arm_count>
``` 

Terraform configuration is defined in the `*.tfvars` files.
See [variables.tf](https://github.com/dashpay/dash-network-deploy/blob/master/terraform/aws/variables.tf) for all available options.

Ansible configuration is stored in the `*.yml` file. The 
[group_vars/all](https://github.com/dashpay/dash-network-deploy/blob/master/ansible/group_vars/all)
file contains the majority of playbook options.
The rest are defined in [ansible roles](https://github.com/dashpay/dash-network-deploy/tree/master/ansible/roles).

Configure your credentials in the `.env` file.

### Using git

Please don't forget to include the following in your `.gitignore`:
```
.env
*.inventory
*.ovpn
```

## Deployment

To deploy a Dash Network, use the `deploy` command with a particular network name:

```bash
dash-network deploy <network_name>
```

You may pass the `--only-infrastructure` or `--only-provisioning` option to target either infrastructure or software provisioning workflows.

To destroy an available Dash Network, use the `destroy` command:

```bash
dash-network destroy -t=<target> <network_name>
```

You can use the `-t` flag to choose which logical network components you want to destroy. It takes one of three values:
* all (infrastructure with software)
* network (L2+L1)
* platform (L2 only)

Destroying only the network with `-t=network` allows you to redeploy the network in almost the same state by passing the `-p` option to the `deploy` command to skip infrastructure provisioning.

Destroying only the L2 platform components with `-t=platform` means you must comment out everything except roles which target masternodes and seed nodes in the `deploy.yml` playbook, and run the deployment again with the `-p` option.

## List network services

```bash
dash-network list <network_name>
```

## Testing

To test the network, run the `test` command with with particular network name:

```bash
dash-network test <network_name>
```

You may pass the `--type` option to run only particular tests (`smoke`, `e2e`).
It is possible to specify several types using a comma delimiter.

## Debugging

There are two commands that can be useful for debugging:

- Show service logs: `dash-network logs <network_name> <host> [docker logs options] <service_name>`
  - See [Docker log options](https://docs.docker.com/engine/reference/commandline/logs/) for details
  - Example: `dash-network logs devnet-example node-1 --since 3h dashd`
- Execute Dash Core RPC command: `dash-network dash-cli <network_name> <hostname> <rpc_command>`

## Deploy Dash Platform

In order to deploy platform services, use the ansible variable:

    ```yaml
    evo_services: true
    ```

## Connect to private Dash Network services

You can use the OpenVPN config generated during deployment (`<network_name>.ovpn`) to connect to private services.

## Manual installation

1. Clone git repository:

    ```bash
    git clone https://github.com/dashpay/dash-network-deploy.git
    ```

2. Install Ansible (v2.11.4+) and Terraform (v1.4.4+) per instructions provided on the official websites:

    * [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
    * [Terraform](https://www.terraform.io/intro/getting-started/install.html)

3. Ensure Python dependencies are installed locally

    ```bash
    pip install -U netaddr jmespath ansible-lint boto3 botocore
    ```

4. Install pre-requisite Ansible roles

    ```bash
    ansible-galaxy install -r ansible/requirements.yml
    ```

5. Install [AWS Command Line Interface](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)


6. Install [Node.JS](https://nodejs.org/en/download/) and dependencies:

    ```bash
    npm install
    ```

7. Install OpenVPN:

    On Linux:
    ```bash
    apt-get install openvpn
    ```

    On Mac:
    ```bash
    brew install openvpn
    ```

## New AWS account setup

If you are running this tool for the first time in a new AWS account, some initial setup needs to be done one time:

note: Please ensure you have the correct REGION and PROFILE setup in your AWS CLI configuration (`aws configure`) or use the --region and --profile flags with the AWS commands below.

1. Create Terraform state S3 bucket manually:

```sh
aws s3 mb s3://bucket-name-here
```

2. Create Terraform state dynamodb lock table manually

```sh
aws dynamodb create-table \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --table-name tf-lock-table-test \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=2,WriteCapacityUnits=2 \
  --table-class STANDARD
```

3. Route53 domain creation / delegation

```sh
aws route53 create-hosted-zone --name networks.domain.tld --caller-reference 1234567
```

Please note the values of these, as they will be needed in the network config files.
