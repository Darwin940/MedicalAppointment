<?php
declare(strict_types=1);

namespace App\Tests\Validators;

use App\Validators\MedicoValidator;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class MedicoValidatorTest extends TestCase
{
    private MedicoValidator $validator;

    protected function setUp(): void
    {
        $this->validator = new MedicoValidator();
    }

    public function testAcceptsAValidDoctor(): void
    {
        self::assertSame([], $this->validator->validate($this->validDoctor()));
    }

    public function testPhoneIsOptional(): void
    {
        $doctor = $this->validDoctor();
        unset($doctor['telefono']);

        self::assertSame([], $this->validator->validate($doctor));
    }

    #[DataProvider('invalidFieldProvider')]
    public function testRejectsInvalidFields(string $field, mixed $value): void
    {
        $doctor = $this->validDoctor();
        $doctor[$field] = $value;

        self::assertArrayHasKey($field, $this->validator->validate($doctor));
    }

    public static function invalidFieldProvider(): array
    {
        return [
            'non-positive specialty' => ['especialidad_id', 0],
            'invalid full name' => ['nombre_completo', 'Ana'],
            'missing license' => ['licencia', ''],
            'invalid username characters' => ['username', 'doctor_01'],
            'password without a symbol' => ['password', 'Clave123'],
            'invalid phone format' => ['telefono', '123-4567'],
        ];
    }

    private function validDoctor(): array
    {
        return [
            'especialidad_id' => 2,
            'nombre_completo' => 'Maria Elena Rodriguez',
            'licencia' => 'MED-123',
            'username' => 'doctor123',
            'password' => 'Clave123#',
            'telefono' => '2222-3333',
        ];
    }
}
