function services_list() {
    # Refresh state
    terraform_run_command "refresh"

    # Ensure ansible inventory
    terraform_output_inventory

    # Ensure vpn config
    ansible_download_vpn_config

    # Output services info
    override_aws_credentials "TERRAFORM" "ANSIBLE"

    cd terraform/aws

    terraform output -raw services

    cd ../..
}
