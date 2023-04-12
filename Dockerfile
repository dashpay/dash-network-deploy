FROM ubuntu:22.04

LABEL maintainer="Dash Developers <dev@dash.org>"
LABEL description="Dash Network Deployment Tool"

# Install build utils and Firefox deps

RUN apt-get update -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    bzip2 \
    ca-certificates \
    curl \
    git \
    gnupg \
    libasound2 \
    libdbus-glib-1-2 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxtst6 \
    openvpn \
    python3-pip \
    python3-setuptools \
    software-properties-common \
    ssh \
    unzip

# Install Node.JS

RUN curl -sSL https://deb.nodesource.com/setup_16.x | bash - && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    nodejs

# Install terraform

ARG TERRAFORM_VERSION=1.4.4
RUN curl -fsSLO https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
    unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip -d /usr/bin && \
    rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip

# Install Docker client

ENV DOCKERVERSION=23.0.3
RUN curl -fsSLO https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKERVERSION}.tgz \
    && tar xzvf docker-${DOCKERVERSION}.tgz --strip 1 -C /usr/local/bin docker/docker \
    && rm docker-${DOCKERVERSION}.tgz

# Install Firefox

ENV FIREFOX_VERSION=111.0.1
RUN curl -fsSLO https://download-installer.cdn.mozilla.net/pub/firefox/releases/${FIREFOX_VERSION}/linux-x86_64/en-US/firefox-${FIREFOX_VERSION}.tar.bz2 \
    && tar xjvf firefox-${FIREFOX_VERSION}.tar.bz2 -C /opt \
    && ln -s /opt/firefox/firefox /usr/local/bin/firefox \
    && rm firefox-${FIREFOX_VERSION}.tar.bz2

# Copy dash-cli form dashd image

COPY --from=dashpay/dashd:latest /usr/local/bin/dash-cli /usr/local/bin

# Copy sources

WORKDIR /usr/src/app

# Install ansible playbook and Node.JS dependencies

COPY ansible/requirements.yml /ansible-requirements.yml

COPY package*.json ./

RUN python3 -m pip install -U pip && \
    python3 -m pip install --upgrade netaddr awscli jmespath ansible && \
    ansible-galaxy install -r /ansible-requirements.yml && \
    npm install

# Remove build utils
RUN apt-get remove --purge -y \
    python3-pip \
    python3-setuptools \
    unzip \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY . .

# Create networks shortcut

RUN ln -s /usr/src/app/networks /networks

VOLUME ["/networks"]
VOLUME ["/usr/src/app/terraform/aws/.terraform"]

ENTRYPOINT ["/usr/src/app/docker/entrypoint.sh"]

CMD ["deploy", "--help"]
