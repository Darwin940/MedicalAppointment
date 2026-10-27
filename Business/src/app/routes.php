<?php
namespace App\controllers;

use Slim\Routing\RouteCollectorProxy;

$app->group('/api', function(RouteCollectorProxy $api) {
    $api->group('/auth', function(RouteCollectorProxy $endpoint) {
        $endpoint->post('/login', Auth::class . ':login');
        $endpoint->patch('/logout/{id}', Auth::class . ':logout');
    });
    $medicoRoutes = function(RouteCollectorProxy $endpoint) {
        $endpoint->get('[/{id}]', Medico::class . ':read');
        $endpoint->get('/filter/{offset}/{limit}', Medico::class . ':filter');
        $endpoint->post('', Medico::class . ':create');
        $endpoint->put('/{id}', Medico::class . ':update');
        $endpoint->delete('/{id}', Medico::class . ':delete');
    };
    $api->group('/medicos', $medicoRoutes);
    $api->group('/medico', $medicoRoutes);

    $pacienteRoutes = function(RouteCollectorProxy $endpoint) {
        $endpoint->get('[/{id}]', Paciente::class . ':read');
        $endpoint->get('/filter/{offset}/{limit}', Paciente::class . ':filter');
        $endpoint->post('', Paciente::class . ':create');
        $endpoint->put('/{id}', Paciente::class . ':update');
        $endpoint->delete('/{id}', Paciente::class . ':delete');
    };
    $api->group('/pacientes', $pacienteRoutes);
    $api->group('/paciente', $pacienteRoutes);

    $citasRoutes = function(RouteCollectorProxy $endpoint) {
        $endpoint->get('[/{id}]', Citas::class . ':read');
        $endpoint->get('/paciente/{id}', Citas::class . ':readPaciente');
        $endpoint->get('/medico/{id}', Citas::class . ':readMedico');
        $endpoint->post('', Citas::class . ':create');
        $endpoint->put('/{id}', Citas::class . ':update');
    };
    $api->group('/citas', $citasRoutes);
    $api->group('/cita', $citasRoutes);
});
