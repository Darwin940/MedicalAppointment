<?php

declare(strict_types=1);

namespace App\controllers;

use Firebase\JWT\JWT;
use App\Services\DataService;
use Psr\Container\ContainerInterface;

class Tokens
{
    public function __construct(protected ContainerInterface $container) {}

    public function generateTokens(array $credentials): array
    {
        $id = $credentials['id'];
        $username = $credentials['username'];
        $rol_id = $credentials['rol_id'];
        $now = time();
        $config = $this->container->get('config');

        $payload = [
            'iss' => 'citas-medicas-business',
            'iat' => $now,
            'exp' => $now + $config->jwt_ttl,
            'sub' => $id,
            'username' => $username,
            'rol_id' => $rol_id,
        ];
        $payloadRef = [
            'iss' => 'citas-medicas-business',
            'iat' => $now,
            'sub' => $id,
        ];

        return [
            'token' => JWT::encode($payload, $config->key, 'HS256'),
            'tkRef' => JWT::encode($payloadRef, $config->key, 'HS256'),
        ];
    }

    protected function saveRefreshToken(string $id, string $tkRef)
    {
        $service = $this->container->get(DataService::class);
        return $service->put('auth/tkref/' . $id, json_encode(
            ['tkRef' => $tkRef],
            JSON_THROW_ON_ERROR
        ));
    }

    protected function verifyToken(string $id, string $tkRef)
    {
        $service = $this->container->get(DataService::class);
        $upstream = $service->post('auth/verify_token/' . $id, json_encode(
            ['tkRef' => $tkRef],
            JSON_THROW_ON_ERROR
        ));

        return json_decode((string) $upstream->getBody(), true);
    }
}
