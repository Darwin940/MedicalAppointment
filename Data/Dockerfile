FROM php:8.4.19-apache
WORKDIR /var/www/html

#COPY ./Data

RUN sed -i 's/DocumentRoot.*$/DocumentRoot \/var\/www\/html\/public/' /etc/apache2/sites-enabled/000-default.conf