# Dash Cluster Ansible


## What is this?

This is a project to setup and manage devnet, testnet, mainnet networks. Devnets
are like regular Dash networks (mainnet, testnet) but easier to bootstrap and easier to have
multiple in parallel.

This project is work in progress and in its initial state only meant to be used by Dash Core
developers to assist in Dash Evolution development.

Detailed documentation on how to use this repo will come when more interest from the public
arises or when Evolution is released.


## Install Prerequisites

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

4. Configure env variables in `.env`

    ```bash
    cp .env.example .env
    source .env
    ```

## Getting started

Create your own network configuration in `networks`. Use `devnet-example.*` as a skeleton. The
following commands will all directly use the aws-example, while you should change it to use
your own config.

1. Initialize terraform w/remote AWS backend configuration:

    ```bash
    $ cd terraform/aws
    $ terraform init \
        -backend-config="bucket=$TERRAFORM_S3_BUCKET" \
        -backend-config="key=$TERRAFORM_S3_KEY" \
        -backend-config="region=$AWS_DEFAULT_REGION" \
        -backend-config="dynamodb_table=$TERRAFORM_DYNAMODB_LOCK_TABLE"
    ```

2. Select/create terraform workspace according to dash network name (testnet/regtest/mainnet/devnet-{name}):

    ```bash
    $ terraform workspace new devnet-example
    ```

3. Setup the AWS infrastructure with terraform:

    ```
    $ terraform apply -var-file=../../networks/devnet-example.tfvars
    ```

4. Create the inventory file for Ansible:

    ```bash
    $ terraform output ansible_inventory > ../../networks/devnet-example.inventory
    ```

5. Invoke ansible-playbook:

    ```bash
    $ cd ../.. # Go back to root dir of project
    $ ansible-playbook --private-key="{path-to-key}" -i networks/devnet-example.inventory -e @networks/devnet-example.yml create-network.yml
    ```

## Services

### DashCore

### Multi faucet

### Sentinel

### Insight

[Insight service](https://insight.dash.org/insight/) is available from internet on 3001 port of AWS ELB.

Note: You can get your AWS ELB DNS name using aws cli

```bash
aws elb describe-load-balancers --load-balancer-names={workspace/network name} | grep DNSName
```

### IPFS
