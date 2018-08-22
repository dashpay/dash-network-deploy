#!/usr/bin/env bash

# Override AWS credentials

# TODO Use loop

if [ ! -z ${TERRAFORM_AWS_PROFILE} ]; then
    if [ -z ${ANSIBLE_AWS_PROFILE} ]; then
        print_error "TERRAFORM_AWS_PROFILE is defined. ANSIBLE_AWS_PROFILE must be defined too"
    fi

    AWS_PROFILE="$TERRAFORM_AWS_PROFILE"
fi
if [ ! -z ${TERRAFORM_AWS_ACCESS_KEY_ID} ]; then
    if [ -z ${ANSIBLE_AWS_ACCESS_KEY_ID} ]; then
        print_error "TERRAFORM_AWS_ACCESS_KEY_ID is defined. ANSIBLE_AWS_ACCESS_KEY_ID must be defined too"
    fi

    AWS_ACCESS_KEY_ID="$TERRAFORM_AWS_ACCESS_KEY_ID"
fi

if [ ! -z ${TERRAFORM_AWS_SECRET_ACCESS} ]; then
    if [ -z ${ANSIBLE_AWS_SECRET_ACCESS} ]; then
        print_error "TERRAFORM_AWS_SECRET_ACCESS is defined. ANSIBLE_AWS_SECRET_ACCESS must be defined too"
    fi

    AWS_SECRET_ACCESS="$TERRAFORM_AWS_SECRET_ACCESS"
fi

if [ ! -z ${TERRAFORM_AWS_REGION} ]; then
    if [ -z ${ANSIBLE_AWS_REGION} ]; then
        print_error "TERRAFORM_AWS_REGION is defined. ANSIBLE_AWS_REGION must be defined too"
    fi

    AWS_REGION="$TERRAFORM_AWS_REGION"
fi

cd terraform/aws

# Get AWS region from AWS profile if not present

if [ -z ${AWS_REGION} ] && [ ! -z ${AWS_PROFILE} ]; then
    AWS_REGION="$(aws configure get region)"
fi

# Initialize terraform w/remote AWS backend configuration

terraform init \
    -backend-config="bucket=$TERRAFORM_S3_BUCKET" \
    -backend-config="key=$TERRAFORM_S3_KEY" \
    -backend-config="region=$AWS_REGION" \
    -backend-config="dynamodb_table=$TERRAFORM_DYNAMODB_TABLE"


# Select/create terraform workspace according to dash network name

set +e

terraform workspace select ${NETWORK_NAME} 2>/dev/null

set -e

if [ $? != 0 ]; then
    terraform workspace new ${NETWORK_NAME}
fi


# Setup the AWS infrastructure with terraform

TERRAFORM_CONFIG_PATH_ARG=""
if [ -f "../../$TERRAFORM_CONFIG_PATH" ]; then
    TERRAFORM_CONFIG_PATH_ARG="-var-file=../../$TERRAFORM_CONFIG_PATH";
fi

terraform apply -var "public_key_path=$PUBLIC_KEY_PATH" \
                ${TERRAFORM_CONFIG_PATH_ARG}


# Create the inventory file for Ansible

terraform output ansible_inventory > ../../${INVENTORY_FILE}

cd ../../
