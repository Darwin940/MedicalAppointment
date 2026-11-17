<?php

declare(strict_types=1);

namespace App\controllers;

use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;
use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\DataService;

final class Auth extends Tokens
{
    public function __construct(ContainerInterface $container)
    {
        parent::__construct($container);
    }

    public function login(Request $request, Response $response): Response
    {
        $request->getBody()->rewind();
        $data = $request->getParsedBody();
        $data = is_array($data) ? $data : [];
        $username = trim((string) ($data['username'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($username === '' || $password === '') {
            return $this->json($response, [
                'error' => 'El usuario y la contraseña son obligatorios.',
            ], 422);
        }

        try {
            $service = $this->container->get(DataService::class);
            $upstream = $service->post('auth/credentials', json_encode([
                'username' => $username,
                'password' => $password,
            ], JSON_THROW_ON_ERROR));

            $credentials = json_decode((string) $upstream->getBody(), true);

            if ($upstream->getStatusCode() !== 200 || !is_array($credentials)) {
                return $this->json($response, ['error' => 'Credenciales inválidas.'], 401);
            }

            $tokens = $this->generateTokens($credentials);
            $this->saveRefreshToken((string) $credentials['id'], $tokens['tkRef']);

            return $this->json($response, $tokens, 200);
        } catch (ConnectException) {
            return $this->json($response, ['error' => 'El servicio de datos no está disponible.'], 502);
        } catch (RequestException) {
            return $this->json($response, ['error' => 'No se pudo consultar el servicio de datos.'], 502);
        }
    }

    public function loggout(Request $request, Response $response, array $args): Response
    {
        try {
            $this->saveRefreshToken((string) $args['id'], '');
            return $this->json($response, ['message' => 'Sesión cerrada correctamente.'], 200);
        } catch (ConnectException) {
            return $this->json($response, ['error' => 'El servicio de datos no está disponible.'], 502);
        } catch (RequestException) {
            return $this->json($response, ['error' => 'No se pudo consultar el servicio de datos.'], 502);
        }
    }

    public function logout(Request $request, Response $response, array $args): Response
    {
        return $this->loggout($request, $response, $args);
    }

    public function refreshSession(Request $request, Response $response, array $args): Response
    {
        $body = $request->getParsedBody();
        if (!is_array($body)) {
            $request->getBody()->rewind();
            $body = json_decode((string) $request->getBody(), true);
        }

        if (!is_array($body) || !is_string($body['tkRef'] ?? null) || $body['tkRef'] === '') {
            return $this->json($response, ['error' => 'El token de refresco es obligatorio.'], 422);
        }

        try {
            $data = $this->verifyToken((string) $args['id'], $body['tkRef']);

            if (!is_array($data) || empty($data)) {
                return $this->json($response, ['error' => 'Token de refresco inválido.'], 401);
            }

            $tokens = $this->generateTokens($data);
            $this->saveRefreshToken((string) $data['id'], $tokens['tkRef']);

            return $this->json($response, $tokens, 200);
        } catch (\Throwable) {
            return $this->json($response, ['error' => 'Token de refresco inválido.'], 401);
        }
    }

    public function refresh(Request $request, Response $response, array $args): Response
    {
        return $this->refreshSession($request, $response, $args);
    }

    private function json(Response $response, array $payload, int $status): Response
    {
        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
        return $response->withHeader('Content-Type', 'application/json; charset=utf-8')->withStatus($status);
    }
}
