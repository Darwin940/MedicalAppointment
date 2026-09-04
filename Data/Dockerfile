FROM php:8.4.19-apache
WORKDIR /var/www/html

RUN docker-php-ext-install pdo_mysql \
    && a2enmod rewrite \
    && sed -i 's/DocumentRoot.*$/DocumentRoot \/var\/www\/html\/public/' /etc/apache2/sites-enabled/000-default.conf

COPY ./Data /var/www/html/

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && rm -rf /var/lib/apt/lists/* \
    && composer install --no-dev --no-interaction --optimize-autoloader