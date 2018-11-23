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

    echo "Starting OpenVPN with sudo privileges..."

    test_start_openvpn

    echo "Running mocha tests..."

    test_run_mocha
}

function test_start_openvpn() {
    ansible_download_vpn_config

    OPENVPN_MANAGMENT_HOST="127.0.0.1"
    OPENVPN_MANAGMENT_PORT=1337

    local sudo_command=''
    if [ $(whoami) != 'root' ]; then
        sudo_command='sudo'
    fi

    set +e

    ${sudo_command} openvpn --daemon \
                            --config "$VPN_CONFIG_PATH" \
                            --management ${OPENVPN_MANAGMENT_HOST} ${OPENVPN_MANAGMENT_PORT}

    local exit_code="$?"

    set -e

    if [ "$exit_code" != 0 ]; then
        print_error "Can't start OpenVPN. Please check your system log."
    fi
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
