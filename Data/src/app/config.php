<?php
$container->set('config_db', function() {
    return(object) [
        'host' => $_ENV['DB_HOST'],
        'username' => $_ENV['DB_USER'],
        'password' => $_ENV['DB_PASSW'],
        'database' => $_ENV['DB_NAME'],
        'charset' => $_ENV['DB_CHARSET'],
    ];
});
