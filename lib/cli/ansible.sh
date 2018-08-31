function run_ansible_playbook() {
    override_aws_credentials "ANSIBLE" "TERRAFORM"

    cd ansible

    # Invoke ansible-playbook

    if [ ! -f "../$INVENTORY_FILE" ]; then
        print_error "Ansible inventory file not found. Please read README.md how to create infrastructure with Terraform"
    fi

    if [ ! -f "../$ANSIBLE_CONFIG_PATH" ]; then
        print_error "Ansible network config '$ANSIBLE_CONFIG_PATH' is not found. Please read README.md how to configure networks"
    fi

    ansible-playbook --private-key="$PRIVATE_KEY_PATH" \
                     -i "../$INVENTORY_FILE" \
                     -e "@../$ANSIBLE_CONFIG_PATH" \
                     -e "dash_network=$NETWORK" \
                     -e "dash_devnet_name=$NETWORK_DEVNET_NAME" \
                     "$ANSIBLE_ARGUMENTS" \
                     ${1}

    cd ..
}
