import { Component, signal, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MedicoCreateInput, MedicoModel } from '../../../shared/models/medico-model';
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

interface MedicoDialogData {
  title: string;
  data?: MedicoModel;
  info?: boolean;
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
export class FrmMedico implements OnInit {
  titulo: string = "";
  private readonly dialogRef = inject(MatDialogRef<FrmMedico, MedicoCreateInput | undefined>);

  private readonly dialog = inject(MatDialog);
  private readonly data = inject<MedicoDialogData>(MAT_DIALOG_DATA);
  readonly isEditing = this.data.data !== undefined;

  objMedico = signal<MedicoCreateInput>({
    especialidad_id: 0,
    nombre_completo: '',
    licencia: '',
    telefono: '',
    username: '',
    password: ''
  });

  frmMedico = form(this.objMedico, (s) => {
    required(s.especialidad_id, {message: "Especialidad es requerida"});
    validate(s.especialidad_id, (context: RootFieldContext<number>): { kind: string; message: string } | null => {
      const value = context.value();
      const numericValue = Number(value); 
      if (isNaN(numericValue) || !Number.isInteger(numericValue) ||  numericValue <= 0) {
        return { kind: 'invalid', message: 'Especialidad inválida' };
      }
      return null;
    });

    required(s.nombre_completo, {message: "El nombe es requerido"});
    minLength(s.nombre_completo, 6, {message: "El nombre debe tener al menos 11 caracteres"});
    maxLength(s.nombre_completo, 150, {message: "El nombre no puede tener más de 150 caracteres"});
    matchesPattern(s.nombre_completo, /^[A-Za-zÑñÁÉÍÓÚáéíóú]{2,}(?: [A-Za-zÑñÁÉÍÓÚáéíóú]{2,}){1,3}$/, "Formato de nombre inválido");
    required(s.licencia, {message: "Licencia es requerida"});
    minLength(s.licencia, 8, {message: 'La licencia debe contener al menos 8 caracteres'});
    maxLength(s.licencia, 50, {message: 'La licencia no puede contener más de 50 caracteres'});

    if (!this.isEditing) {
      required(s.username!, {message: 'Nombre de usuario es requerido'});
      minLength(s.username!, 8, {message: "El usuario debe tener al menos 8 caracteres"});
      maxLength(s.username!, 16, {message: "El usuario no puede tener más de 16 caracteres"});
      matchesPattern(s.username!, /^[a-z0-9]{8,16}$/, "Formato de usuario inválido");

      required(s.password!, {message: 'Contraseña es requerido'});
      minLength(s.password!, 8, {message: "La contraseña debe tener al menos 8 caracteres"});
      maxLength(s.password!, 64, {message: "La contraseña no puede tener más de 64 caracteres"});
      matchesPattern(s.password!, /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[#$@*])[\s\S]{8,64}$/, "Formato de usuario inválido");
    }

    matchesPattern(s.telefono!, /^[2-9][0-9]{3}-[0-9]{4}$/, "Formato de teléfono inválido");

  }, {
    submission: {
      action: async () => {
        this.dialogRef.close(this.objMedico());
      }
    }
  });

  ngOnInit() : void {
    this.titulo = this.data.title;
    if (this.data.data) {
      this.objMedico.set({
        especialidad_id: this.data.data.especialidad_id,
        nombre_completo: this.data.data.nombre_completo,
        licencia: this.data.data.licencia,
        telefono: this.data.data.telefono ?? '',
        username: '',
        password: '',
      });
    }
  }
}
