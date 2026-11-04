<?php

declare(strict_types=1);

namespace App\controllers;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;
use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\DataService;

final class Auth
{
    public function __construct(private ContainerInterface $container) {}

    public function generateTokens(string $id, string $username, int $rol_id): array
    {
        $config = $this->container->get('config');
        return Tokens::generateTokens($id, $username, $rol_id, $config);
    }

    public function login(Request $request, Response $response): Response
    {
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
                return $this->json($response, [
                    'error' => 'Credenciales inválidas.',
                ], 401);
            }

            $tokens = $this->generateTokens((string) $credentials['id'], (string) $credentials['username'], (int) $credentials['rol_id']);

            $service->put('auth/tkref/' . $credentials['id'], json_encode([
                'tkRef' => $tokens['tkRef'],
            ], JSON_THROW_ON_ERROR));

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
            $service = $this->container->get(DataService::class);
            $service->put('auth/tkref/' . $args['id'], json_encode([
                'tkRef' => ''
            ], JSON_THROW_ON_ERROR)); 

            return $this->json($response, [
                'message' => 'Sesión cerrada correctamente.',
                'msj' => 'Sesión cerrada',
            ], 200);
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

    public function refresh(Request $request, Response $response, array $args): Response
    {
        $body = json_decode((string) $request->getBody(), true);
        $tkRef = is_array($body) ? (string) ($body['tkRef'] ?? '') : '';

        $datos = $this->verificarToken((string) ($args['id'] ?? ''), $tkRef);
        $status = (int) ($datos['status'] ?? 401);
        $info = json_decode((string) ($datos['body'] ?? '{}'), true);

        if ($status === 200 && is_array($info)) {
            $rolId = (int) ($info['rol_id'] ?? $info['rol'] ?? 1);
            $username = (string) ($info['username'] ?? '');
            $tokens = $this->generarToken((string) $args['id'], $rolId, $username);
            $this->modificarToken((string) $args['id'], $tokens['tkRef']);

            return $this->json($response, $tokens, 200);
        }

        return $this->json($response, is_array($info) ? $info : ['error' => 'No autorizado'], $status);
    }

    private function verificarToken(string $id, string $tkRef): array
    {
        if ($id === '' || $tkRef === '') {
            return ['status' => 401, 'body' => json_encode(['error' => 'Token de refresco inválido'])];
        }

        try {
            $config = $this->container->get('config');
            $decoded = JWT::decode($tkRef, new Key($config->key, 'HS256'));

            if ((string) ($decoded->sub ?? '') !== (string) $id) {
                return ['status' => 401, 'body' => json_encode(['error' => 'El token no corresponde al usuario'])];
            }

            return [
                'status' => 200,
                'body' => json_encode([
                    'rol' => (int) ($decoded->rol_id ?? 1),
                    'rol_id' => (int) ($decoded->rol_id ?? 1),
                    'username' => (string) ($decoded->username ?? ''),
                ]),
            ];
        } catch (\Throwable) {
            return ['status' => 401, 'body' => json_encode(['error' => 'Token de refresco expirado o inválido'])];
        }
    }

    private function generarToken(string $id, int $rol = 1, string $username = ''): array
    {
        $config = $this->container->get('config');
        return Tokens::generateTokens($id, $username, $rol, $config);
    }

    private function modificarToken(string $cedula, string $tkRef): void
    {
        $service = $this->container->get(DataService::class);
        $service->put('auth/tkref/' . $cedula, json_encode(['tkRef' => $tkRef], JSON_THROW_ON_ERROR));
    }

    private function json(Response $response, array $payload, int $status): Response
    {
        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
        return $response->withHeader('Content-Type', 'application/json; charset=utf-8')->withStatus($status);
    }
}
