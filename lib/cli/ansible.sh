function ansible_run_playbook() {
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
                     -e "dash_network_name=$NETWORK_NAME" \
                     -e "dash_network=$NETWORK" \
                     -e "dash_devnet_name=$NETWORK_DEVNET_NAME" \
                     ${ANSIBLE_ARGS} \
                     "$1"

    cd ..
}

function ansible_get_ip_by_host() {
    while IFS='' read -r line || [[ -n "$line" ]]; do
    if [[ "$line" = ${1}* ]]; then
        echo $(expr "$line" : '.* ansible_host=\([0-9\.]*\).*')
        break;
    fi
    done < "$INVENTORY_FILE"
}

function ansible_download_vpn_config() {
    if [ ! -f "$VPN_CONFIG_PATH" ]; then
        echo "OpenVPN config '$VPN_CONFIG_PATH' not found. Trying to retrieve..."

        override_aws_credentials "ANSIBLE" "TERRAFORM"

        cd ansible

        ansible vpn --private-key="$PRIVATE_KEY_PATH" \
                    -b \
                    -i "../$INVENTORY_FILE" \
                    -m "fetch" \
                    -a "src=/etc/openvpn/$NETWORK_NAME-vpn.ovpn dest=../networks/$NETWORK_NAME/$NETWORK_NAME.ovpn flat=true"

        cd ..

        echo "OpenVPN config fetched successfully."
    fi
}
