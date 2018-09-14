function run_mocha() {
    if [ ! -f "$INVENTORY_FILE" ]; then
        print_error "Ansible inventory file not found. Please read README.md how to create infrastructure with Terraform"
    fi

    if [ ! -f "$ANSIBLE_CONFIG_PATH" ]; then
        print_error "Ansible network config '$ANSIBLE_CONFIG_PATH' is not found. Please read README.md how to configure networks"
    fi

    # Export ansible inventory file

    ANSIBLE_INVENTORY_EXPORT_PATH="networks/$NETWORK_NAME-inventory.json"

    ANSIBLE_GROUP_VARS_PATH="ansible/group_vars/all"

    ANSIBLE_INVENTORY=$(ansible-inventory --list --export -i "$INVENTORY_FILE")

    # Select tests

    if [ -z ${TEST_TYPES} ]; then
        TEST_TYPES="smoke,e2e"
    fi

    TEST_TYPES_STRING=""
    IFS=',' read -ra TEST_TYPES_ARRAY <<< "$TEST_TYPES"
    for TYPE in "${TEST_TYPES_ARRAY[@]}"; do
        TEST_TYPES_STRING="$TEST_TYPES_STRING test/$TYPE/**/*.spec.js"
    done

    # Run mocha tests

    node_modules/.bin/_mocha ${MOCHA_ARGUMENTS} ${TEST_TYPES_STRING} --timeout 10000
}
