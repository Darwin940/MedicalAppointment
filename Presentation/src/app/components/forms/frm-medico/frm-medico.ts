import { Component, signal, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MedicoCreateInput } from '../../../shared/models/medico-model';
import { form, FormField, FormRoot, maxLength, minLength, required, RootFieldContext, SchemaPath, validate } from '@angular/forms/signals';

function matchesPattern(
  field: SchemaPath<string>,
  pattern: RegExp,
  message: string,
  optional = false,
) {
  return validate(field, (context: RootFieldContext<string>): { kind: string; message: string } | null => {
    const value = context.value();
    return (optional && !value) || pattern.test(value)
      ? null
      : { kind: 'pattern', message };
  });
}

@Component({
  imports: [
    MatDialogModule, MatDividerModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    FormRoot, FormField
],
  selector: 'app-frm-medico',
  styleUrl: './frm-medico.css',
  templateUrl: './frm-medico.html',
})
export class FrmMedico {
  titulo: string = "Formulario de Medico";
  dialogRef = inject(MatDialogRef<FrmMedico>)
  private readonly dialog = inject(MatDialog);

  objMedico = signal<MedicoCreateInput>({
    especialidad_id: 0,
    nombre_completo: '',
    licencia: '',
    telefono: '',
    username: '',
    password: ''
  });

  frmMedico = form(this.objMedico, (s) =>  {
    required(s.especialidad_id, {message: 'Especialidad es requerida'});
    validate(s.especialidad_id, (context: RootFieldContext<number>): { kind: string; message: string } | null => {
      const value = context.value();
      const numericValue = Number(value); 
      if (isNaN(numericValue) || !Number.isInteger(numericValue)) {
        return value > 0 ? null : { kind: 'invalid', message: 'Especialidad inválida' };
      }
      return null;
    });

    required(s.nombre_completo, {message: 'Nombre completo es requerido'});
    minLength(s.nombre_completo, 2, { message: 'El nombre debe tener al menos 2 caracteres' });
    maxLength(s.nombre_completo, 50, { message: 'El nombre debe tener como máximo 50 caracteres' });
    matchesPattern(
      s.nombre_completo,
      /^[A-Za-zÑñáéíóú]+( [A-Za-zÑñáéíóú]+){1,3}$/,
      'Formato de nombre incorrecto',
    );

    required(s.licencia, {message: 'Licencia es requerida'});
    matchesPattern(
      s.telefono!,
      /^[2-9]?[0-9]{3}\-[0-9]{4}$/,
      'Formato de teléfono incorrecto',
      true,
    );
    required(s.username!, {message: 'Nombre de usuario es requerido'});
    required(s.password!, {message: 'Contraseña es requerida'});

  })
}
