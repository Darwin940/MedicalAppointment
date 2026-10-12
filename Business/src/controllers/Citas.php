<?php

declare(strict_types=1);

namespace App\controllers;

use App\Services\DataService;
use App\Validators\CitasValidator;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;
use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class Citas
{
    public function __construct(private ContainerInterface $container)
    {
    }

    public function read(Request $request, Response $response, array $args): Response
    {
        try {
            $dataService = $this->container->get(DataService::class);
            $path = isset($args['id']) ? 'citas/' . rawurlencode((string) $args['id']) : 'citas';

            $upstream = $dataService->get($path);
            return $this->proxyResponse($response, $upstream);
        } catch (ConnectException) {
            return $this->json($response, ['error' => 'El servicio de datos no está disponible.'], 502);
        } catch (RequestException) {
            return $this->json($response, ['error' => 'No se pudo consultar el servicio de datos.'], 502);
        }
    }

    public function readPaciente(Request $request, Response $response, array $args): Response
    {
        return $this->readById($response, $args['id'] ?? null, 'paciente_id', 'citas/paciente/');
    }

    public function readMedico(Request $request, Response $response, array $args): Response
    {
        return $this->readById($response, $args['id'] ?? null, 'medico_id', 'citas/medico/');
    }

    public function create(Request $request, Response $response, array $args): Response
    {
        $body = $this->readBody($request);
        $data = json_decode($body, true);
        if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
            return $this->json($response, ['errors' => ['body' => 'Debe enviar un objeto JSON válido.']], 422);
        }

        $errors = (new CitasValidator())->validateCreate($data);
        if ($errors !== []) {
            return $this->json($response, ['errors' => $errors], 422);
        }
        $body = json_encode($this->normalize($data), JSON_THROW_ON_ERROR);

        try {
            $upstream = $this->container->get(DataService::class)->post('citas', $body);
            return $this->proxyResponse($response, $upstream);
        } catch (ConnectException) {
            return $this->json($response, ['error' => 'El servicio de datos no está disponible.'], 502);
        } catch (RequestException) {
            return $this->json($response, ['error' => 'No se pudo consultar el servicio de datos.'], 502);
        }
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $validator = new CitasValidator();
        $id = $args['id'] ?? null;
        $idErrors = $validator->validateId($id);
        if ($idErrors !== []) {
            return $this->json($response, ['errors' => $idErrors], 422);
        }

        $body = $this->readBody($request);
        $data = json_decode($body, true);
        if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
            return $this->json($response, ['errors' => ['body' => 'Debe enviar un objeto JSON válido.']], 422);
        }

        $errors = $validator->validateUpdate($data);
        if ($errors !== []) {
            return $this->json($response, ['errors' => $errors], 422);
        }
        $body = json_encode($this->normalize($data), JSON_THROW_ON_ERROR);

        try {
            $upstream = $this->container->get(DataService::class)->put('citas/' . rawurlencode((string) $id), $body);
            return $this->proxyResponse($response, $upstream);
        } catch (ConnectException) {
            return $this->json($response, ['error' => 'El servicio de datos no está disponible.'], 502);
        } catch (RequestException) {
            return $this->json($response, ['error' => 'No se pudo consultar el servicio de datos.'], 502);
        }
    }

    private function readById(Response $response, mixed $id, string $field, string $path): Response
    {
        $errors = (new CitasValidator())->validateId($id, $field);
        if ($errors !== []) {
            return $this->json($response, ['errors' => $errors], 422);
        }

        try {
            $upstream = $this->container->get(DataService::class)->get($path . rawurlencode((string) $id));
            return $this->proxyResponse($response, $upstream);
        } catch (ConnectException) {
            return $this->json($response, ['error' => 'El servicio de datos no está disponible.'], 502);
        } catch (RequestException) {
            return $this->json($response, ['error' => 'No se pudo consultar el servicio de datos.'], 502);
        }
    }

    private function readBody(Request $request): string
    {
        $request->getBody()->rewind();
        return (string) $request->getBody();
    }

    private function normalize(array $data): array
    {
        foreach (['paciente_id', 'medico_id'] as $field) {
            if (array_key_exists($field, $data)) {
                $data[$field] = (int) $data[$field];
            }
        }

        if (array_key_exists('fecha_hora', $data)) {
            $data['fecha_hora'] = trim($data['fecha_hora']);
        }
        if (isset($data['motivo'])) {
            $data['motivo'] = trim($data['motivo']);
            if ($data['motivo'] === '') {
                $data['motivo'] = null;
            }
        }

        return $data;
    }

    private function proxyResponse(Response $response, Response $upstream): Response
    {
        $response->getBody()->write((string) $upstream->getBody());
        return $response
            ->withHeader('Content-Type', $upstream->getHeaderLine('Content-Type') ?: 'application/json; charset=utf-8')
            ->withStatus($upstream->getStatusCode());
    }

    private function json(Response $response, array $payload, int $status): Response
    {
        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
        return $response
            ->withHeader('Content-Type', 'application/json; charset=utf-8')
            ->withStatus($status);
    }
}