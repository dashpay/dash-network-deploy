# Validate network name

networks=("regtest testnet devnet mainnet")

if grep -q "devnet" <<< "$NETWORK_NAME"; then
    NETWORK="devnet"
    NETWORK_DEVNET_NAME="${NETWORK_NAME:7}"
    if [ -z $NETWORK_DEVNET_NAME ]; then
        print_error "Invalid devnet network name format. Required format is 'devnet-<name>'"
    fi
elif [[ " ${networks[@]} " =~ " ${NETWORK_NAME} " ]]; then
    NETWORK="$NETWORK_NAME"
else
    print_error "Invalid network name '$NETWORK_NAME'. Supported networks: regtest, devnet-<name>, testnet, mainnet"
fi

INVENTORY_FILE="networks/$NETWORK_NAME.inventory"
ANSIBLE_CONFIG_PATH="networks/$NETWORK_NAME.yml"
TERRAFORM_CONFIG_PATH="networks/$NETWORK_NAME.tfvars"
VPN_CONFIG_PATH="networks/$NETWORK_NAME.ovpn"

# Load configuration

if [ ! -f networks/.env ]; then

    dotenv_example=$(<./.env.example)

    print_error "Configuration .env file not found

Please create and configure '.env' file.

Example:

$dotenv_example"

else
    source networks/.env
fi
