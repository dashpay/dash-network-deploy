function run_terraform_command() {
    override_aws_credentials "TERRAFORM" "ANSIBLE"

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

    SELECT_EXIT_CODE="$?"

    set -e

    if [ ${SELECT_EXIT_CODE} != 0 ]; then
        terraform workspace new ${NETWORK_NAME}
    fi


    # Setup the AWS infrastructure with terraform

    TERRAFORM_CONFIG_PATH_ARG=""
    if [ -f "../../$TERRAFORM_CONFIG_PATH" ]; then
        TERRAFORM_CONFIG_PATH_ARG="-var-file=../../$TERRAFORM_CONFIG_PATH";
    fi

    terraform ${1} -var "public_key_path=$PUBLIC_KEY_PATH" \
                    ${TERRAFORM_CONFIG_PATH_ARG}


    # Create the inventory file for Ansible

    terraform output ansible_inventory > ../../${INVENTORY_FILE}

    cd ../../
}
