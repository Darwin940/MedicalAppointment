<?php
declare(strict_types=1);

namespace App\Tests\Validators;

use App\Validators\PacienteValidator;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class PacienteValidatorTest extends TestCase
{
    private PacienteValidator $validator;

    protected function setUp(): void
    {
        $this->validator = new PacienteValidator();
    }

    public function testAcceptsAValidPatient(): void
    {
        self::assertSame([], $this->validator->validate($this->validPatient()));
    }

    public function testAcceptsAValidDimex(): void
    {
        $patient = $this->validPatient();
        $patient['cedula'] = '512345678901';

        self::assertSame([], $this->validator->validate($patient));
    }

    public function testPhoneIsOptional(): void
    {
        $patient = $this->validPatient();
        unset($patient['telefono']);

        self::assertSame([], $this->validator->validate($patient));
    }

    public function testEmptyOptionalPhoneIsAccepted(): void
    {
        $patient = $this->validPatient();
        $patient['telefono'] = '';

        self::assertSame([], $this->validator->validate($patient));
    }

    #[DataProvider('invalidFieldProvider')]
    public function testRejectsInvalidFields(string $field, mixed $value): void
    {
        $patient = $this->validPatient();
        $patient[$field] = $value;

        self::assertArrayHasKey($field, $this->validator->validate($patient));
    }

    public static function invalidFieldProvider(): array
    {
        return [
            'short ID' => ['cedula', '12345678'],
            'invalid full name' => ['nombre_completo', 'Ana'],
            'invalid birth date' => ['fecha_nacimiento', 'not-a-date'],
            'invalid username characters' => ['username', 'Maria_123'],
            'password without a symbol' => ['password', 'Clave123'],
            'phone containing a space instead of a digit' => ['telefono', '2222- 333'],
        ];
    }

    private function validPatient(): array
    {
        return [
            'cedula' => '123456789',
            'nombre_completo' => 'Maria Elena Rodriguez',
            'fecha_nacimiento' => '1990-05-17',
            'username' => 'maria123',
            'password' => 'Clave123#',
            'telefono' => '2222-3333',
        ];
    }
}
