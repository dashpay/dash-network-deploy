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

Getting started
---------------

Create your own cluster configuration in `clusters`. Use `aws-example.*` as a skeleton. The
following commands will all directly use the aws-example, while you should change it to use
your own config.

Setup the AWS infrastructure with terraform:

```bash
$ cd terraform/aws
$ terraform apply -var-file=../../clusters/aws-example.tfvars
```

Create the inventory file for Ansible

```bash
$ terraform output ansible_inventory > ../../clusters/aws-example.inventory
```

Invoke ansible-playbook
```bash
$ cd ../.. # Go back to root dir of project
$ ansible-playbook -i clusters/aws-example.inventory -e @clusters/aws-example.yml cluster.yml
```
