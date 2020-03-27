function terraform_init() {
    override_aws_credentials "TERRAFORM" "ANSIBLE"

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
}

function terraform_select_workspace() {
    set +e

    terraform workspace select ${1} 2>/dev/null

    local exit_code="$?"

    set -e

    if [ ${exit_code} != 0 ]; then
        terraform workspace new ${1}
    fi
}

function terraform_run_command() {
    cd terraform/aws

    terraform_init

    # Select/create terraform workspace according to dash network name

    terraform_select_workspace "$NETWORK_NAME"

    # Setup the AWS infrastructure with terraform

    local config_path_arg=""
    if [ -f "../../$TERRAFORM_CONFIG_PATH" ]; then
        config_path_arg="-var-file=../../$TERRAFORM_CONFIG_PATH";
    fi

    terraform ${1}  -var "public_key_path=$PUBLIC_KEY_PATH" \
                    -var "public_network_name=$NETWORK_DEVNET_NAME" \
                    ${config_path_arg}


    # Create the inventory file for Ansible

    terraform output ansible_inventory > ../../${INVENTORY_FILE}

    cd ../../
}

function terraform_output_inventory() {
    if [ ! -f "$INVENTORY_FILE" ]; then
        echo "Ansible inventory '$INVENTORY_FILE' file not found. Trying to retrieve..."

        cd terraform/aws

        terraform_init

        terraform workspace select "$NETWORK_NAME"

        terraform output ansible_inventory > ../../${INVENTORY_FILE}

        echo "Ansible inventory file successfully created."

        cd ../../
    fi
}
