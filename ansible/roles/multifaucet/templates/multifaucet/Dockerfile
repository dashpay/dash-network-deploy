FROM php:5.6-apache-jessie

RUN sed -i '/deb http:\/\/deb.debian.org\/debian jessie-updates main/d' /etc/apt/sources.list && \
    apt-get -o Acquire::Check-Valid-Until=false update && \
    apt-get install -y libpng12-0 libjpeg62-turbo libpng-dev libjpeg-dev libfreetype6 libfreetype6-dev \
  && docker-php-ext-configure gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/ \
  && docker-php-ext-install mysqli gd \
  && apt-get remove -y libpng-dev libjpeg-dev libfreetype6-dev \
  && rm -fr /var/cache/apt/*

ENV MULTIFAUCET_COMMIT=5c625ee79be085c80f09098c6ee8213c0ef3c633
RUN curl -L -o /tmp/multifaucet.tar.gz https://github.com/tuaris/multifaucet/archive/$MULTIFAUCET_COMMIT.tar.gz \
  && cd /tmp \
  && tar xzf multifaucet.tar.gz \
  && mv multifaucet-$MULTIFAUCET_COMMIT/* /var/www/html/ \
  && rm -rf multifaucet-$MULTIFAUCET_COMMIT multifaucet.tar.gz \
  && rm /var/www/html/install.php

ADD *.conf.php /var/www/html/config/
ADD *.ini /usr/local/etc/php/
#RUN date > /var/www/html/config/.install_complete

# Make configuration directory writable so the user can continue withe the web installer
RUN chown -R www-data:www-data /var/www/html/config/
RUN chmod -R 700 /var/www/html/config/

# Make cold wallet directory writable so the user can continue with the the web installer
RUN mkdir -p /var/db/multifaucet && chown -R www-data:www-data /var/db/multifaucet/
RUN chmod -R 700 /var/db/multifaucet/

ENV MULTIFAUCET_DB_HOST=db
ENV MULTIFAUCET_DB_NAME=multifaucet
ENV MULTIFAUCET_DB_USER=multifaucet
ENV MULTIFAUCET_DB_PASS=multifaucet
ENV MULTIFAUCET_DB_PRFX=faucet_

ENV MULTIFAUCET_PAYMENT_GW_RPC_USER=rpcuser
ENV MULTIFAUCET_PAYMENT_GW_RPC_PASS=rpcpass
ENV MULTIFAUCET_PAYMENT_GW_RPC_ENCR=""
ENV MULTIFAUCET_ADDRESS_VERSION=0
