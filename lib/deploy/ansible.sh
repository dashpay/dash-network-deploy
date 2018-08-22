#!/usr/bin/env bash

# Override AWS credentials

# TODO Use loop

if [ ! -z ${ANSIBLE_AWS_PROFILE} ]; then
    if [ -z ${TERRAFORM_AWS_PROFILE} ]; then
        print_error "ANSIBLE_AWS_PROFILE is defined. TERRAFORM_AWS_PROFILE must be defined too"
    fi

    AWS_PROFILE="$ANSIBLE_AWS_PROFILE"
fi

if [ ! -z ${ANSIBLE_AWS_ACCESS_KEY_ID} ]; then
    if [ -z ${TERRAFORM_AWS_ACCESS_KEY_ID} ]; then
        print_error "ANSIBLE_AWS_ACCESS_KEY_ID is defined. TERRAFORM_AWS_ACCESS_KEY_ID must be defined too"
    fi

    AWS_ACCESS_KEY_ID="$ANSIBLE_AWS_ACCESS_KEY_ID"
fi

if [ ! -z ${ANSIBLE_AWS_SECRET_ACCESS} ]; then
    if [ -z ${TERRAFORM_AWS_SECRET_ACCESS} ]; then
        print_error "ANSIBLE_AWS_SECRET_ACCESS is defined. TERRAFORM_AWS_SECRET_ACCESS must be defined too"
    fi

    AWS_SECRET_ACCESS="$ANSIBLE_AWS_SECRET_ACCESS"
fi

if [ ! -z ${ANSIBLE_AWS_REGION} ]; then
    if [ -z ${TERRAFORM_AWS_REGION} ]; then
        print_error "ANSIBLE_AWS_REGION is defined. TERRAFORM_AWS_REGION must be defined too"
    fi

    AWS_REGION="$ANSIBLE_AWS_REGION"
fi

cd ansible

# Invoke ansible-playbook

if [ ! -f "../$INVENTORY_FILE" ]; then
    echo "Ansible inventory file not found. Please read README.md how to create infrastructure with Terraform"
    echo ""
    print_usage
    exit 1
fi

ANSIBLE_CONFIG_PATH_ARG=""
if [ -f "../$ANSIBLE_CONFIG_PATH" ]; then
    ANSIBLE_CONFIG_PATH_ARG="-e @../$ANSIBLE_CONFIG_PATH";
fi

ansible-playbook --private-key="$PRIVATE_KEY_PATH" \
                 -i "../$INVENTORY_FILE" \
                 ${ANSIBLE_CONFIG_PATH_ARG} \
                 -e "dash_network=$NETWORK" \
                 -e "dash_devnet_name=$NETWORK_DEVNET_NAME" \
                 create-network.yml
