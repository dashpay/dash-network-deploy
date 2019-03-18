OPENVPN_MANAGMENT_HOST="127.0.0.1"
OPENVPN_MANAGMENT_PORT=1337

function openvpn_start() {
    echo "Starting OpenVPN with sudo privileges..."

    ansible_download_vpn_config

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

function openvpn_wait_for_connect() {
    local timeout=10

    for i in $(seq ${timeout}); do
        # Bash magic for tcp sockets
        if exec 3<>/dev/tcp/${OPENVPN_MANAGMENT_HOST}/${OPENVPN_MANAGMENT_PORT}; then
            # Consume all header input
            while read -t "0.1" <&3; do true; done
            echo "state" >&3
            read -t 1 <&3
            echo -n $REPLY | grep -q "CONNECTED,SUCCESS" && break || true
            exec 3>&-
        fi

        # Else sleep
        sleep 1
    done

    if [[ ${i} -ge ${timeout} ]]; then
        print_error "Cannot connect to VPN"
    fi
}
