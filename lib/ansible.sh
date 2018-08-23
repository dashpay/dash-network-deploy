function run_ansible_playbook() {
    override_aws_credentials "ANSIBLE" "TERRAFORM"

    cd ansible

    # Invoke ansible-playbook

    if [ ! -f "../$INVENTORY_FILE" ]; then
        print_error "Ansible inventory file not found. Please read README.md how to create infrastructure with Terraform"
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
                     ${ANSIBLE_ARGUMENTS} \
                     ${1}

    cd ..
}
