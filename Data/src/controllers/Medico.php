<?php

namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

use Psr\Container\ContainerInterface;
// SOLUCIÓN Error 2: Se importa el modelo Eloquent App\Models\Medico con el alias
// MedicoModel. Sin este 'use', PHP buscaba 'App\controllers\MedicoModel' (no existía)
// y lanzaba "Class App\controllers\MedicoModel not found".
use App\Models\Medico as MedicoModel;
use App\Models\User;
use Illuminate\Database\QueryException;
use RuntimeException;


class Medico {
    private $container;
    public function __construct(ContainerInterface $c){
        $this->container = $c;
    }
    public function create(Request $request, Response $response, array $args): Response {
        $data = $request->getParsedBody();
        $data = is_array($data) ? $data : [];

        $errors = [];
        $specialtyId = filter_var($data['especialidad_id'] ?? null, FILTER_VALIDATE_INT);
        $fullName = trim((string) ($data['nombre_completo'] ?? ''));
        $license = trim((string) ($data['licencia'] ?? ''));
        $phone = isset($data['telefono']) ? trim((string) $data['telefono']) : null;
        $username = trim((string) ($data['username'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($specialtyId === false || $specialtyId === null || $specialtyId < 1) {
            $errors['especialidad_id'] = 'Debe ser un entero positivo.';
        }
        if ($fullName === '' || mb_strlen($fullName) > 150) {
            $errors['nombre_completo'] = 'Es obligatorio y debe tener máximo 150 caracteres.';
        }
        if ($license === '' || mb_strlen($license) > 50) {
            $errors['licencia'] = 'Es obligatoria y debe tener máximo 50 caracteres.';
        }
        if ($username === '' || mb_strlen($username) > 50) {
            $errors['username'] = 'Es obligatorio y debe tener máximo 50 caracteres.';
        }
        if (mb_strlen($password) < 8) {
            $errors['password'] = 'Debe tener al menos 8 caracteres.';
        }
        if ($phone !== null && $phone === '') {
            $phone = null;
        } elseif ($phone !== null && mb_strlen($phone) > 20) {
            $errors['telefono'] = 'Debe tener máximo 20 caracteres.';
        }

        if ($errors !== []) {
            return $this->json($response, ['errors' => $errors], 422);
        }

        try {
            $eloquent = $this->container->get('eloquent');
            $medico = $eloquent->connection()->transaction(
                static function () use ($specialtyId, $fullName, $license, $phone, $username, $password): MedicoModel {
                    $roleId = User::query()
                        ->from('roles')
                        ->where('nombre', 'Médico')
                        ->value('id');

                    if ($roleId === null) {
                        throw new RuntimeException('El rol Médico no está configurado.');
                    }

                    $user = User::create([
                        'username' => $username,
                        'password' => password_hash($password, PASSWORD_DEFAULT),
                        'rol_id' => $roleId,
                        'activo' => true,
                    ]);

                    return MedicoModel::create([
                        'usuario_id' => $user->id,
                        'especialidad_id' => $specialtyId,
                        'nombre_completo' => $fullName,
                        'licencia' => $license,
                        'telefono' => $phone,
                    ]);
                }
            );
        } catch (QueryException $exception) {
            if ((int) ($exception->errorInfo[1] ?? 0) === 1062) {
                $message = (string) ($exception->errorInfo[2] ?? '');

                if (str_contains($message, 'username')) {
                    return $this->json($response, ['error' => 'El nombre de usuario ya está registrado.'], 409);
                }

                return $this->json($response, ['error' => 'La licencia ya está registrada.'], 409);
            }

            throw $exception;
        }

        return $this->json($response, ['data' => $medico->toArray()], 201);
    }
    private function json(response $response, array $payload, int $status): Response {
        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
        return $response
            ->withHeader('Content-Type', 'application/json; charset=utf-8')
            ->withStatus($status);
    }

    public function read(Request $request, Response $response, array $args){
        // SOLUCIÓN Error 1: Se eliminó la llamada $this->container->get('eloquent') porque
        // Eloquent ya se bootea al arrancar la app (en App.php). Aquí se usa el modelo directamente.
        $medicos = MedicoModel::query()
        ->select(['id','especialidad_id', 'nombre_completo', 'licencia', 'telefono'])
        ->get()
        ->toArray();
        

        $response->getBody()->write(json_encode(["data" => $medicos], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));

        return $response
        ->withHeader('Content-Type', 'application/json; charset=utf-8')
        ->withStatus(200);
    } 
}
