import { Component, inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

import { Patient, PatientInput } from '../models/api.models';
import { ApiService } from '../services/api.service';
import { errorMessage } from '../services/error-message';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.page.html',
  styleUrls: ['./pacientes.page.scss'],
  standalone: false,
})
export class PacientesPage {
  private readonly api = inject(ApiService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

  patients: Patient[] = [];
  loading = false;
  modalOpen = false;
  editingId: number | null = null;
  filters = { nombre: '', cedula: '' };
  draft: PatientInput = this.emptyDraft();

  ionViewWillEnter(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.api.filterPatients(this.filters).subscribe({
      next: (response) => {
        this.patients = response.data;
        this.loading = false;
      },
      error: async (error: unknown) => {
        this.loading = false;
        await this.showToast(errorMessage(error), 'danger');
      },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.draft = this.emptyDraft();
    this.modalOpen = true;
  }

  openEdit(patient: Patient): void {
    this.editingId = patient.id;
    this.draft = {
      cedula: patient.cedula,
      nombre_completo: patient.nombre_completo,
      fecha_nacimiento: patient.fecha_nacimiento.slice(0, 10),
      telefono: patient.telefono ?? '',
    };
    this.modalOpen = true;
  }

  closeForm(): void {
    this.modalOpen = false;
  }

  save(): void {
    const data: PatientInput = {
      ...this.draft,
      cedula: this.draft.cedula?.trim(),
      nombre_completo: this.draft.nombre_completo.trim(),
      fecha_nacimiento: this.draft.fecha_nacimiento,
      telefono: this.draft.telefono.trim(),
      username: this.draft.username?.trim(),
      password: this.draft.password,
    };

    if (
      !data.nombre_completo ||
      !data.fecha_nacimiento ||
      (this.editingId === null && (!data.cedula || !data.username || !data.password || data.password.length < 8))
    ) {
      void this.showToast('Revise los campos requeridos. La contraseña debe tener al menos 8 caracteres.', 'warning');
      return;
    }

    const request = this.editingId === null
      ? this.api.createPatient(data)
      : this.api.updatePatient(this.editingId, data);
    request.subscribe({
      next: async () => {
        this.modalOpen = false;
        this.loadPatients();
        await this.showToast(this.editingId === null ? 'Paciente creado.' : 'Paciente actualizado.', 'success');
      },
      error: async (error: unknown) => this.showToast(errorMessage(error), 'danger'),
    });
  }

  async delete(patient: Patient): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar paciente',
      message: `¿Desea eliminar a ${patient.nombre_completo}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'confirm',
          handler: () => this.api.deletePatient(patient.id).subscribe({
            next: async () => {
              this.loadPatients();
              await this.showToast('Paciente eliminado.', 'success');
            },
            error: async (error: unknown) => this.showToast(errorMessage(error), 'danger'),
          }),
        },
      ],
    });
    await alert.present();
  }

  private emptyDraft(): PatientInput {
    return {
      cedula: '',
      nombre_completo: '',
      fecha_nacimiento: '',
      telefono: '',
      username: '',
      password: '',
    };
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({ message, color, duration: 3000 });
    await toast.present();
  }
}
