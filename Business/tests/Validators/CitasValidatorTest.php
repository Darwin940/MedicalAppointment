<?php
declare(strict_types=1);

namespace App\Tests\Validators;

use App\Validators\CitasValidator;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class CitasValidatorTest extends TestCase
{
    private CitasValidator $validator;

    protected function setUp(): void
    {
        $this->validator = new CitasValidator();
    }

    public function testAcceptsAValidAppointment(): void
    {
        self::assertSame([], $this->validator->validateCreate($this->validAppointment()));
    }

    public function testAcceptsAnAppointmentWithoutOptionalReason(): void
    {
        $appointment = $this->validAppointment();
        unset($appointment['motivo']);

        self::assertSame([], $this->validator->validateCreate($appointment));
    }

    #[DataProvider('invalidCreateFieldProvider')]
    public function testRejectsInvalidAppointmentFields(string $field, mixed $value): void
    {
        $appointment = $this->validAppointment();
        $appointment[$field] = $value;

        self::assertArrayHasKey($field, $this->validator->validateCreate($appointment));
    }

    public static function invalidCreateFieldProvider(): array
    {
        return [
            'non-positive patient ID' => ['paciente_id', 0],
            'non-numeric doctor ID' => ['medico_id', 'abc'],
            'impossible date' => ['fecha_hora', '2026-02-30 10:00:00'],
            'non-text reason' => ['motivo', 123],
            'unsupported field' => ['id', 1],
        ];
    }

    public function testAcceptsAValidPartialUpdate(): void
    {
        self::assertSame([], $this->validator->validateUpdate(['motivo' => 'Consulta']));
    }

    public function testRejectsAnUpdateWithoutAllowedFields(): void
    {
        self::assertArrayHasKey('body', $this->validator->validateUpdate([]));
    }

    public function testRejectsAnUpdateWithOnlyUnsupportedFields(): void
    {
        $errors = $this->validator->validateUpdate(['id' => 5]);

        self::assertArrayHasKey('id', $errors);
        self::assertArrayHasKey('body', $errors);
    }

    public function testAcceptsAValidPositiveId(): void
    {
        self::assertSame([], $this->validator->validateId('42', 'paciente_id'));
    }

    #[DataProvider('invalidIdProvider')]
    public function testRejectsInvalidIds(mixed $id): void
    {
        self::assertArrayHasKey('id', $this->validator->validateId($id));
    }

    public static function invalidIdProvider(): array
    {
        return [
            'zero' => [0],
            'negative' => [-1],
            'non-numeric' => ['abc'],
            'fractional' => [1.5],
            'missing' => [null],
        ];
    }

    private function validAppointment(): array
    {
        return [
            'paciente_id' => 1,
            'medico_id' => 2,
            'fecha_hora' => '2026-10-15 10:00:00',
            'motivo' => 'Consulta general',
        ];
    }
}
