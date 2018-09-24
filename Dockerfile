FROM ubuntu:16.04

LABEL maintainer="Dash Developers <dev@dash.org>"
LABEL description="DashDrive Node.JS"

# Install build utils

RUN apt-get update -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    unzip \
    python-minimal \
    python-pip \
    git

# Add apt repositories

RUN curl -s https://swupdate.openvpn.net/repos/repo-public.gpg|apt-key add - && \
    echo "deb http://build.openvpn.net/debian/openvpn/stable xenial main" > /etc/apt/sources.list.d/openvpn.list && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 93C4A3FD7BB9C367 && \
    echo "deb http://ppa.launchpad.net/ansible/ansible/ubuntu xenial main" > /etc/apt/sources.list.d/ansible.list && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash -

# Install dependencies from apt repos

RUN apt-get update -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ansible \
    openvpn \
    nodejs

# Install terraform

ARG TERRAFORM_VERSION=0.11.8

RUN curl -O https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
    unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip -d /usr/bin && \
    rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip

# Copy sources

WORKDIR /usr/src/app

COPY . .

# Install ansible playbook and Node.JS dependencies

RUN pip install --upgrade netaddr awscli paramiko Crypto && \
    ansible-galaxy install -r ansible/requirements.yml && \
    npm install

# Remove build utils

RUN apt-get remove --purge -y \
        python-pip \
        unzip \
        curl \
        git \
        && rm -rf /var/lib/apt/lists/*

# Create networks shortcut

RUN ln -s /usr/src/app/networks /networks

VOLUME ["/networks"]
VOLUME ["/usr/src/app/terraform/aws/.terraform"]

ENTRYPOINT ["docker/entrypoint.sh"]

CMD ["deploy", "--help"]
