function openvpn_start() {
    echo "Starting OpenVPN with sudo privileges..."

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
