<?php

declare(strict_types=1);

namespace App\Validators;

final class CitasValidator
{
    public function validateId(mixed $id, string $field = 'id'): array
    {
        $validatedId = filter_var($id, FILTER_VALIDATE_INT);
        if ($validatedId === false || $validatedId < 1) {
            return [$field => 'Debe ser un entero positivo.'];
        }

        return [];
    }

    public function validateCreate(array $data): array
    {
        $errors = [];
        $allowedFields = ['paciente_id', 'medico_id', 'fecha_hora', 'motivo'];

        foreach (array_diff(array_keys($data), $allowedFields) as $field) {
            $errors[$field] = 'Este campo no se puede enviar al crear una cita.';
        }

        foreach (['paciente_id', 'medico_id'] as $field) {
            $validatedId = filter_var($data[$field] ?? null, FILTER_VALIDATE_INT);
            if ($validatedId === false || $validatedId < 1) {
                $errors[$field] = 'Debe ser un entero positivo.';
            }
        }

        if (!$this->isValidDateTime($data['fecha_hora'] ?? null)) {
            $errors['fecha_hora'] = 'Debe tener el formato Y-m-d H:i:s.';
        }

        if (array_key_exists('motivo', $data) && $data['motivo'] !== null && !is_string($data['motivo'])) {
            $errors['motivo'] = 'El motivo debe ser texto o null.';
        }

        return $errors;
    }

    public function validateUpdate(array $data): array
    {
        $allowedFields = ['paciente_id', 'medico_id', 'fecha_hora', 'motivo'];
        $errors = [];

        foreach (array_diff(array_keys($data), $allowedFields) as $field) {
            $errors[$field] = 'Este campo no se puede actualizar en una cita.';
        }

        if (array_intersect(array_keys($data), $allowedFields) === []) {
            $errors['body'] = 'Debe indicar al menos un campo válido para actualizar.';
        }

        foreach (['paciente_id', 'medico_id'] as $field) {
            if (!array_key_exists($field, $data)) {
                continue;
            }

            $validatedId = filter_var($data[$field], FILTER_VALIDATE_INT);
            if ($validatedId === false || $validatedId < 1) {
                $errors[$field] = 'Debe ser un entero positivo.';
            }
        }

        if (array_key_exists('fecha_hora', $data) && !$this->isValidDateTime($data['fecha_hora'])) {
            $errors['fecha_hora'] = 'Debe tener el formato Y-m-d H:i:s.';
        }

        if (array_key_exists('motivo', $data) && $data['motivo'] !== null && !is_string($data['motivo'])) {
            $errors['motivo'] = 'El motivo debe ser texto o null.';
        }

        return $errors;
    }

    private function isValidDateTime(mixed $value): bool
    {
        if (!is_string($value)) {
            return false;
        }

        $dateTime = trim($value);
        $parsedDateTime = \DateTimeImmutable::createFromFormat('!Y-m-d H:i:s', $dateTime);
        $dateErrors = \DateTimeImmutable::getLastErrors();

        return $parsedDateTime !== false
            && ($dateErrors === false || ($dateErrors['warning_count'] === 0 && $dateErrors['error_count'] === 0))
            && $parsedDateTime->format('Y-m-d H:i:s') === $dateTime;
    }
}