import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';
import { FrmMedico } from './frm-medico';
import { MedicoModel } from '../../../shared/models/medico-model';

describe('FrmMedico', () => {
  let component: FrmMedico;
  let fixture: ComponentFixture<FrmMedico>;
  const dialogRef = { close: vi.fn() };
  const dialogData: { title: string; data?: MedicoModel } = { title: 'Nuevo Médico' };

  beforeEach(async () => {
    dialogRef.close.mockClear();
    dialogData.title = 'Nuevo Médico';
    dialogData.data = undefined;

    await TestBed.configureTestingModule({
      imports: [FrmMedico],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FrmMedico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close with the medico data when the form is valid', async () => {
    const medico = {
      especialidad_id: 1,
      nombre_completo: 'Ana Maria Lopez',
      licencia: 'LIC-12345',
      telefono: '8888-1234',
      username: 'ana12345',
      password: 'Ana12345#',
    };
    component.objMedico.set(medico);

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();

    expect(dialogRef.close).toHaveBeenCalledWith(medico);
  });

  it('should not close when the form is invalid', async () => {
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should prefill the form with the selected doctor', () => {
    fixture.destroy();
    dialogData.title = 'Editar Médico';
    dialogData.data = {
      id: 1,
      especialidad_id: 2,
      nombre_completo: 'Ana Maria Lopez',
      licencia: 'LIC-12345',
      telefono: '8888-1234',
    };

    fixture = TestBed.createComponent(FrmMedico);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.objMedico()).toEqual({
      especialidad_id: 2,
      nombre_completo: 'Ana Maria Lopez',
      licencia: 'LIC-12345',
      telefono: '8888-1234',
      username: '',
      password: '',
    });
    expect(component.isEditing).toBe(true);
  });
});
