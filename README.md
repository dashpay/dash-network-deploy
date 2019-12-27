# Dash Network Deployment Tool

## Introduction

This tool assists in deploying and managing Dash networks.

There are two regular available networks: `testnet` and `mainnet`.
After deployment your DashCore instances will join those networks.

`regtest` and `devnet-*` networks are for testing purposes.
Devnets are like regular Dash networks (`mainnet` and `testnet`)
but easier to bootstrap and with unique names. This supports having multiple in
parallel.

This is work in progress and in its initial state only meant to be used by
Dash Core developers to assist in Dash Evolution development.

## Installation

1. [Install Docker](https://docs.docker.com/install/)
2. Download tool:

    Using `wget`:

    ```bash
    wget -P /usr/local/bin https://raw.github.com/dashpay/dash-network-deploy/master/bin/dash-network && \
    chmod +x /usr/local/bin/dash-network
    ```

    Using `curl`:

    ```bash
    curl -fsSL -o /usr/local/bin/dash-network https://raw.github.com/dashpay/dash-network-deploy/master/bin/dash-network && \
    chmod +x /usr/local/bin/dash-network
    ```


## Configuration

### Credentials

Configure your credentials in the `.env` file.
Use [.env.example](https://github.com/dashpay/dash-network-deploy/blob/master/examples/.env.example) as an example.

### Networks definition

You can use `generate` command in order to create configs for your network:

```bash
dash-network generate <network_name> <masternode_count>
``` 

Terraform configuration is defined in the `*.tfvars` files.
See [variables.tf](https://github.com/dashpay/dash-network-deploy/blob/master/terraform/aws/variables.tf) for all available options.

Ansible configuration are in the `*.yaml` file.
[group_vars/all](https://github.com/dashpay/dash-network-deploy/blob/master/ansible/group_vars/all)
file contains the majority of playbook options.
The rest are defined in [ansible roles](https://github.com/dashpay/dash-network-deploy/tree/master/ansible/roles).

### Using git

Please don't forget to include the following in your `.gitignore`:
```
.env
*.inventory
*.ovpn
```

## Deployment

To deploy a Dash Network use the `deploy` command with a particular network name:

```bash
dash-network deploy <network_name>
```

You may pass the `--only-infrastructure` or `--only-provisioning` option to avoid to do a particular type of work.

To destroy an available Dash Network use `destroy` command:

```bash
dash-network destroy <network_name>
```

You may pass the `--keep-infrastructure` option to remove only the software and configuration while keeping the infrastructure.

## List network services

```bash
dash-network list <network_name>
```

## Testing

To test the network, run the `test` command with with particular network name:

```bash
dash-network test <network_name>
```

You may pass the `--type` option to run only particular tests (`smoke`, `e2e`).
It is possible to specify several types using comma delimiter.

## Debugging

There are two commands that can be useful for debugging:

- Show service logs: `dash-network logs <network_name> <host> [docker logs options] <service_name>`
  - See [Docker log options](https://docs.docker.com/engine/reference/commandline/logs/) for details
  - Example: `dash-network logs devnet-example node-1 --since 3h dashd`
- Execute Dash Core RPC command: `dash-network dash-cli <network_name> <hostname> <rpc_command>`

## Deploy Dash Evolution

In order to deploy evolution services use ansible variable:

    ```yaml
    evo_services: true
    ```

## Connect to private Dash Network services

You can use the OpenVPN config generated during deployment (`<network_name>.ovpn`) to connect to private services.

## Manual installation

1. Clone git repository:

    ```bash
    git clone https://github.com/dashpay/dash-network-deploy.git
    ```

2. Install Ansible and Terraform per instructions provided on the official websites:

    * [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
    * [Terraform](https://www.terraform.io/intro/getting-started/install.html)

3. Ensure Python netaddr package is installed locally

    ```bash
    pip install -U netaddr
    ```

    * Note: You may need to run the above command with "pip2" instead of "pip" if
      your default Python installation is version 3 (e.g. OSX + Homebrew).

4. Install pre-requisite Ansible roles

    ```bash
    ansible-galaxy install -r ansible/requirements.yml
    ```

5. Install [AWS Command Line Interface](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)


6. Install [Node.JS](https://nodejs.org/en/download/) and dependencies:

    ```bash
    npm install
    ```

7. Install OpenVPN:

    On Linux:
    ```bash
    apt-get install openvpn
    ```

    On Mac:
    ```bash
    brew install openvpn
    ```
