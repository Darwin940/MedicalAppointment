<?php

declare(strict_types= 1);

use Illuminate\Database\Capsule\Manager as Capsule;
use Psr\Container\ContainerInterface;

$container->set('eloquent', function(ContainerInterface $c): Capsule {
$config = $c->get('config_db');
$capsule = new Capsule();


// SOLUCIÓN Error 4: 'charset' debe ser 'utf8mb4' (conjunto de caracteres) y la collation
// 'utf8mb4_unicode_ci' va en su propio campo. Antes 'charset' tenía 'utf8mb4_unicode_ci',
// lo que hacía fallar SET NAMES con "Unknown character set".
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => $config->host,
    'database' => $config->database,
    'username' => $config->username,
    'password' => $config->password,
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();
return $capsule;

});


