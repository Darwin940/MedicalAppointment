<?php
namespace App\controllers;

use Firebase\JWT\JWT;

class Tokens 
{
    public static function generateTokens(string $id, string $username, int $rol_id, $config): array {
        $now = time();
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
}
