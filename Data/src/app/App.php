<?php

use Slim\Factory\AppFactory;
use DI\Container;
use Illuminate\Database\Capsule\Manager as Capsule;

require __DIR__ . '/../../vendor/autoload.php';

$container = new Container();
$dotenv = Dotenv\Dotenv::createImmutable('/var/www/html');
$dotenv->load();

AppFactory::setContainer($container);

$app = AppFactory::create();


require_once __DIR__ . '/routes.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/eloquent.php';

// El crédito de Middleware BodyParsingMiddleware permite que el cuerpo JSON de las
// peticiones (application/json) se parsee a getParsedBody(). Sin él, Slim no lo
// analiza y el POST del endpoint recibe un cuerpo vacío.
$app->addBodyParsingMiddleware();

// SOLUCIÓN Error 3: El Capsule de Eloquent se registra como servicio perezoso (lazy)
// en 'eloquent.php'. Si no se resuelve aquí, setAsGlobal() y bootEloquent() nunca se
// ejecutan y al usar Model::query() falla con "Call to a member function connection() on null".
$container->get('eloquent');

$app->run();