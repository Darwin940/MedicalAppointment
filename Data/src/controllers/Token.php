<?php

declare(strict_types=1);

namespace App\controllers;

use App\Models\User;
use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class Tokens
{
    public function __construct(private ContainerInterface $container) {}

    public function verifyToken(Request $request, Response $response, array $args): Response
    {
        $body = json_decode((string) $request->getBody(), true);
        $tkRef = is_array($body) ? ($body['tkRef'] ?? null) : null;

        $this->container->get('eloquent');

        $valid = is_string($tkRef) && $tkRef !== ''
            && User::query()
                ->where('id', $args['id'])
                ->where('tkRef', $tkRef)
                ->exists();

        $response->getBody()->write(json_encode(['valid' => $valid], JSON_THROW_ON_ERROR));
        return $response
            ->withHeader('Content-Type', 'application/json; charset=utf-8')
            ->withStatus($valid ? 200 : 401);
    }

    public function updateTokenRef(string $id, string $tkRef): void
    {
        $this->container->get('eloquent');
        $user = User::find($id);
        if ($user !== null) {
            $user->tkRef = $tkRef;
            $user->save();
        }
    }
}
