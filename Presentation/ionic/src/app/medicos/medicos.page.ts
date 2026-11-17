import { Component, inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

import { Doctor, DoctorInput } from '../models/api.models';
import { ApiService } from '../services/api.service';
import { errorMessage } from '../services/error-message';

@Component({
  selector: 'app-medicos',
  templateUrl: './medicos.page.html',
  styleUrls: ['./medicos.page.scss'],
  standalone: false,
})
export class MedicosPage {
  private readonly api = inject(ApiService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

  doctors: Doctor[] = [];
  loading = false;
  modalOpen = false;
  editingId: number | null = null;
  filters = { nombre: '', especialidad: '', licencia: '' };
  draft: DoctorInput = this.emptyDraft();

  ionViewWillEnter(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.api.filterDoctors(this.filters).subscribe({
      next: (response) => {
        this.doctors = response.data;
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

  openEdit(doctor: Doctor): void {
    this.editingId = doctor.id;
    this.draft = {
      nombre_completo: doctor.nombre_completo,
      especialidad_id: doctor.especialidad_id,
      licencia: doctor.licencia,
      telefono: doctor.telefono ?? '',
    };
    this.modalOpen = true;
  }

  closeForm(): void {
    this.modalOpen = false;
  }

  save(): void {
    const data: DoctorInput = {
      ...this.draft,
      nombre_completo: this.draft.nombre_completo.trim(),
      especialidad_id: Number(this.draft.especialidad_id),
      licencia: this.draft.licencia.trim(),
      telefono: this.draft.telefono.trim(),
      username: this.draft.username?.trim(),
      password: this.draft.password,
    };

    if (
      !data.nombre_completo ||
      !Number.isInteger(data.especialidad_id) ||
      data.especialidad_id < 1 ||
      !data.licencia ||
      (this.editingId === null && (!data.username || !data.password || data.password.length < 8))
    ) {
      void this.showToast('Revise los campos requeridos. La contraseña debe tener al menos 8 caracteres.', 'warning');
      return;
    }

    const request = this.editingId === null
      ? this.api.createDoctor(data)
      : this.api.updateDoctor(this.editingId, data);
    request.subscribe({
      next: async () => {
        this.modalOpen = false;
        this.loadDoctors();
        await this.showToast(this.editingId === null ? 'Médico creado.' : 'Médico actualizado.', 'success');
      },
      error: async (error: unknown) => this.showToast(errorMessage(error), 'danger'),
    });
  }

  async delete(doctor: Doctor): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar médico',
      message: `¿Desea eliminar a ${doctor.nombre_completo}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'confirm',
          handler: () => this.api.deleteDoctor(doctor.id).subscribe({
            next: async () => {
              this.loadDoctors();
              await this.showToast('Médico eliminado.', 'success');
            },
            error: async (error: unknown) => this.showToast(errorMessage(error), 'danger'),
          }),
        },
      ],
    });
    await alert.present();
  }

  private emptyDraft(): DoctorInput {
    return {
      nombre_completo: '',
      especialidad_id: 0,
      licencia: '',
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
