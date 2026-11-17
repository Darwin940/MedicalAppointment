import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

import { SessionService } from '../services/session.service';
import { errorMessage } from '../services/error-message';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);
  readonly user = this.session.user;

  get canManageCatalogs(): boolean {
    const roleId = this.user()?.roleId;
    return roleId === 1 || roleId === 2;
  }

  async logout(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Desea salir de su cuenta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Salir', role: 'confirm', handler: () => this.confirmLogout() },
      ],
    });
    await alert.present();
  }

  private confirmLogout(): void {
    this.session.logout().subscribe({
      next: () => this.finishLogout(),
      error: async (error: unknown) => {
        this.session.clear();
        await this.showToast(errorMessage(error), 'warning');
        await this.finishLogout();
      },
    });
  }

  private async finishLogout(): Promise<void> {
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({ message, color, duration: 3000 });
    await toast.present();
  }
}
