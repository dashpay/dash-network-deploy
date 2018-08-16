Dash Cluster Ansible
====================

What is this?
-------------

This is an Ansible project to setup and manage devnet (and later testnet) networks. Devnets
are like regular Dash networks (mainnet, testnet) but easier to bootstrap and easier to have
multiple in parallel.

This project is work in progress and in its initial state only meant to be used by Dash Core
developers to assist in Dash Evolution development.

Detailed documentation on how to use this repo will come when more interest from the public
arises or when Evolution is released.


Install Prerequisites
---------------------

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
    ```

Getting started
---------------

Create your own cluster configuration in `clusters`. Use `aws-example.*` as a skeleton. The
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
    $ terraform workspace new devnet-aws-example
    ```

3. Setup the AWS infrastructure with terraform:

    ```
    $ terraform apply -var-file=../../clusters/aws-example.tfvars
    ```

4. Create the inventory file for Ansible:

    ```bash
    $ terraform output ansible_inventory > ../../clusters/aws-example.inventory
    ```

5. Invoke ansible-playbook:

    ```bash
    $ cd ../.. # Go back to root dir of project
    $ ansible-playbook -i clusters/aws-example.inventory -e @clusters/aws-example.yml cluster.yml
    ```
