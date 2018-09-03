# Dash Network Deployment Tool

## Introduction

This tool allows deploy and manage Dash networks.

There are two regular available networks: `testnet` and `mainnet`.
After deployment your DashCore instances will join to those networks.

`regtest` and `devnet-*` are networks for testing purposes.
Devnet are like regular Dash networks (`mainnet` and `testnet`)
but easier to bootstrap and has own name. That's why it easier to have multiple in parallel.  

Work in progress and in its initial state only meant to be used by Dash Core
developers to assist in Dash Evolution development.

Detailed documentation on how to use this repo will come when more interest from the public
arises or when Evolution is released.

## Installation

1. Install Ansible and Terraform per instructions provided on official websites:

    * [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
    * [Terraform](https://www.terraform.io/intro/getting-started/install.html)

2. Install pre-requisite Ansible roles

    ```bash
    ansible-galaxy install geerlingguy.pip geerlingguy.docker
    ```

3. Ensure Python netaddr package installed locally

    ```bash
    pip install -U netaddr
    ```
    
    * Note: You may need to run the above command with "pip2" instead of "pip" if
      your default Python installation is version 3 (e.g. OSX + Homebrew).
      
4. Install [Node.JS](https://nodejs.org/en/download/) and dependecies:

    ```bash
    npm install
    ```

## Configuration

Configure your credentials in `.env` file:

```bash
cp .env.example .env
$EDITOR .env
```

### Evolution configuration
Several Ansible's arguments should be specified in `.env` file to deploy Evolution's services:
```bash
ANSIBLE_ARGUMENTS="-e evo_services=true \
                   -e insight_image=<path-to-image> \
                   -e drive_image=<path-to-image> \
                   -e dapi_image=<path-to-image> \
                   -e dashd_image=<path-to-image>"
```
For Docker images stored in AWS ECR the argument `-e aws_ecr_login=true` is required.

## Networks definition

Use available or create your own network configuration in [networks directory](networks).
Name of files in [networks directory](networks) are equal to Dash network names.

Terraform configuration defined in `*.tfvars` files.
All available options you will find in [variables.tf](terraform/aws/variables.tf) file.
Ansible configuration in `*.yaml` files.
[group_vars/all](ansible/group_vars/all) file contains the majority of playbook options.
The rest of them you will find in `roles/*/vars/main.yml` files.

## Network deployment

To deploy Dash Network run `bin/deploy` command with particular network name:

```bash
./bin/deploy <network_name>
```

You may pass `--skip-infrastructure` option to avoid of running Terraform and building of infrastructure.


## Network destruction

To destroy available Dash Network run `bin/destroy` command with particular network name:

```bash
./bin/destroy <network_name>
```

You may pass `--keep-infrastructure` option to remove software and configuration and keep infrastructure.

## Test network

To test network run `bin/test` command with with particular network name:

```bash
./bin/test <network_name>
```

You may pass `--type` option to run particular type of tests (`smoke`, `e2e`). It possible to specify several types 
using comma delimiter.
