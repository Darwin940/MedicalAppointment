import { Component, inject, OnInit } from '@angular/core';
import { FrmLogin } from '../forms/frm-login/frm-login';
import { MatDialog } from '@angular/material/dialog';
import { LoginForm } from '../../shared/models/interfaces';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  imports: [],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private readonly dialogo = inject(MatDialog);
  private srvAuth = inject(AuthService);
  private readonly router = inject(Router);

  mostrarDialogo() {
    const dialogoRef = this.dialogo.open(FrmLogin, {
      width: '100%',
      maxWidth: '400px',
      disableClose: true
    });
    dialogoRef.afterClosed().subscribe((datosLogin) => {
      if (datosLogin === undefined || datosLogin === false) {
        return;
      }
      this.login(datosLogin);
    });
  }

  login(datos: LoginForm) {
    this.srvAuth.login(datos).subscribe({
      next: (res) => {
        if (res && res !== 401) {
          this.router.navigate(['/home']);
        }
      },
      error: () => {}
    });
  }

  ngOnInit(): void {
    this.mostrarDialogo();
  }  
}
