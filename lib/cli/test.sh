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

    test_ensure_inventory

    echo "Starting OpenVPN with sudo privileges..."

    test_start_openvpn

    echo "Running mocha tests..."

    test_run_mocha
}

function test_start_openvpn() {
    local vpn_config="networks/$NETWORK_NAME.ovpn"

    if [ ! -f "$vpn_config" ]; then
        echo "OpenVPN config '$vpn_config' not found. Trying to retrive..."

        override_aws_credentials "ANSIBLE" "TERRAFORM"

        cd ansible

        ansible vpn --private-key="$PRIVATE_KEY_PATH" \
                    -b \
                    -i "../$INVENTORY_FILE" \
                    -m "fetch" \
                    -a "src=/etc/openvpn/$NETWORK_NAME-vpn.ovpn dest=../networks/$NETWORK_NAME.ovpn flat=true"

        cd ..

        echo "OpenVPN config fetched successfully."
    fi

    OPENVPN_MANAGMENT_HOST="127.0.0.1"
    OPENVPN_MANAGMENT_PORT=1337

    local sudo_command=''
    if [ $(whoami) != 'root' ]; then
        sudo_command='sudo'
    fi

    set +e

    ${sudo_command} openvpn --daemon \
                            --config "$vpn_config" \
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
        TEST_TYPES="smoke,e2e"
    fi

    local test_types_string=""
    IFS=',' read -ra test_type_array <<< "$TEST_TYPES"
    for type in "${test_type_array[@]}"; do
        test_types_string="$test_types_string test/$type/**/*.spec.js"
    done

    # Run mocha tests

    node_modules/.bin/_mocha ${MOCHA_ARGUMENTS} ${test_types_string}
}

function test_ensure_inventory() {
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
