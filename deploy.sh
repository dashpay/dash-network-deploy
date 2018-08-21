#!/usr/bin/env bash

set -e

source ./.env

NETWORK=$2;
INVENTORY_FILE="../../networks/$NETWORK.inventory"

# Initialize terraform w/remote AWS backend configuration

cd terraform/aws

terraform init \
    -backend-config="bucket=$TERRAFORM_S3_BUCKET" \
    -backend-config="key=$TERRAFORM_S3_KEY" \
    -backend-config="region=$AWS_DEFAULT_REGION" \
    -backend-config="dynamodb_table=$TERRAFORM_DYNAMODB_LOCK_TABLE"


# Select/create terraform workspace according to dash network name

set +e

terraform workspace select ${NETWORK} 2>/dev/null

set -e

if [ $? != 0 ]; then
    terraform workspace new ${NETWORK}
fi


# Setup the AWS infrastructure with terraform

terraform apply -var "public_key_path=$PUBLIC_KEY_PATH" \
                -var-file="../../networks/$NETWORK.tfvars"


# Create the inventory file for Ansible

terraform output ansible_inventory > ${INVENTORY_FILE}


# Invoke ansible-playbook

cd ../../ansible

ansible-playbook --private-key="$PRIVATE_KEY_PATH" \
                 -i ${INVENTORY_FILE} \
                 -e @../networks/${NETWORK}.yml \
                 playbooks/create-network.yml
