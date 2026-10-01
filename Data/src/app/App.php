<?php

use Slim\Factory\AppFactory;
use DI\Container;

require __DIR__ . '/../../vendor/autoload.php';


$dotenv = Dotenv\Dotenv::createImmutable('/var/www/html');
$dotenv->load();

$container = new Container();

AppFactory::setContainer($container);

$app = AppFactory::create();
$app->addRoutingMiddleware();
$app->addBodyParsingMiddleware();
$errorMiddleware = $app->addErrorMiddleware(true, true, true);
$errorMiddleware->setErrorHandler(
    \Slim\Exception\HttpNotFoundException::class,
    function ($request, $exception, bool $displayErrorDetails) use ($app) {
        $response = $app->getResponseFactory()->createResponse(404);
        $response->getBody()->write(json_encode([
            'error' => 'Ruta no encontrada.'
        ], JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json; charset=utf-8');
    }
);

require_once "routes.php";
require_once "config.php";
require_once "conexion.php";
require_once "eloquent.php";

$app->run();