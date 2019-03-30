FROM ubuntu:18.04

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
    git \
    openvpn \
    software-properties-common \
    gnupg

# Add apt repositories

RUN apt-add-repository --yes --update ppa:ansible/ansible && \
    curl -sL https://deb.nodesource.com/setup_10.x | bash -

# Install dependencies from apt repos

RUN apt-get update -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ansible \
    nodejs

# Install terraform

ARG TERRAFORM_VERSION=0.11.11

RUN curl -O https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
    unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip -d /usr/bin && \
    rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip

# Install Docker client

ENV DOCKERVERSION=18.06.2-ce
RUN curl -fsSLO https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKERVERSION}.tgz \
  && tar xzvf docker-${DOCKERVERSION}.tgz --strip 1 \
                 -C /usr/local/bin docker/docker \
  && rm docker-${DOCKERVERSION}.tgz

# Copy dash-cli form dashd image

COPY --from=dashpay/dashd:latest /usr/local/bin/dash-cli /usr/local/bin

# Copy sources

WORKDIR /usr/src/app

COPY . .

# Install ansible playbook and Node.JS dependencies

RUN pip install --upgrade netaddr awscli && \
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

ENTRYPOINT ["/usr/src/app/docker/entrypoint.sh"]

CMD ["deploy", "--help"]
