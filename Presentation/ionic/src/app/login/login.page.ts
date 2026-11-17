import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { SessionService } from '../services/session.service';
import { errorMessage } from '../services/error-message';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  username = '';
  password = '';
  loading = false;
  error = '';

  async ionViewWillEnter(): Promise<void> {
    if (this.session.isLoggedIn()) {
      await this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
    }
  }

  login(): void {
    if (this.loading || !this.username.trim() || !this.password) {
      this.error = 'Ingrese su usuario y contraseña.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.session.login({ username: this.username.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        void this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
      },
      error: async (error: unknown) => {
        this.loading = false;
        this.error = errorMessage(error);
      },
    });
  }
}
