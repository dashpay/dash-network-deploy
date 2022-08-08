function test_run() {
    if ! [ -x "$(command -v node)" ]; then
      print_error "Node.JS is not installed.
Please read README.md how to configure tests"
    fi

    if ! [ -x "$(command -v openvpn)" ]; then
      print_error "OpenVPN is not installed.
Please read README.md how to configure tests"
    fi

    if [ ! -f "$ANSIBLE_CONFIG_PATH" ]; then
        print_error "Ansible network config '$ANSIBLE_CONFIG_PATH' is not found.
Please read README.md how to configure networks"
    fi

    terraform_output_inventory

    openvpn_start

    echo "Running mocha tests..."

    set +e

    test_run_mocha

    set -e

    # echo "Running karma tests..."

    # test_run_karma
}

function test_run_mocha() {
    # Export ansible inventory file

    ANSIBLE_GROUP_VARS_PATH="ansible/group_vars/all"
    ANSIBLE_INVENTORY=$(ansible-inventory --list --export -i "$INVENTORY_FILE")

    # Select tests

    if [ -z ${TEST_TYPES} ]; then
        TEST_TYPES="smoke"
    fi

    local test_types_string=""
    IFS=',' read -ra test_type_array <<< "$TEST_TYPES"
    for type in "${test_type_array[@]}"; do
        test_types_string="$test_types_string test/$type/**/*.spec.js"
    done

    # Run mocha tests

    node_modules/.bin/_mocha ${MOCHA_ARGUMENTS} ${test_types_string}
}

function test_run_karma() {
    # Export ansible inventory file

    ANSIBLE_GROUP_VARS_PATH="ansible/group_vars/all"
    ANSIBLE_INVENTORY=$(ansible-inventory --list --export -i "$INVENTORY_FILE")

    # Run karma tests

    node_modules/.bin/karma start --single-run
}
