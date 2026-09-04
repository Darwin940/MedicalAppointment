<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

use Slim\Routing\RouteCollectorProxy;
use App\controllers\Medico;

$app->get('/', function (Request $request, Response $response, array $args) {

    $response->getBody()->write("Hello");
    return $response;
});


$app->get('/hello/{name}', function (Request $request, Response $response, array $args) {
    $name = $args['name'];
    $response->getBody()->write("Hello, $name");
    return $response;
});

$app->group('/api', function (RouteCollectorProxy $api) {
    $api->group('/medico', function(RouteCollectorProxy $endpoint) {
        $endpoint->get('', Medico::class . ':read'); 
        $endpoint->post('', Medico::class . ':create');
        // Define a GET route for the /medico endpoint that maps to the read method of the Medico controller
        // Define routes for the /medico endpoint

    });
});