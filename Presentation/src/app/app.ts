import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from './shared/services/auth-service';

type MenuItem = {
  label : string;
  icon : string;
  route : string;
  rol : number[];
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, MatToolbarModule, MatIconModule, MatButtonModule,
    MatTooltipModule, MatMenuModule, MatSidenavModule, MatListModule, MatDividerModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Presentation');
  protected readonly authService = inject(AuthService);

  menuItems: MenuItem[] = [
    {label: 'Inicio', icon: 'home', route:'home', rol :[1 , 2, 3]},
    {label: 'Medicos', icon: 'stethoscope', route:'medico', rol : [1, 3]},
    {label: 'Pacientes', icon: 'personal_injury', route:'paciente', rol :[1]},
    {label: 'Citas', icon: 'calendar_month', route:'citas', rol :[1]},
  ];

  @HostListener("window:beforeunload") uloadHandler() {
    this.loggout();
  }

  loggout() {
    this.authService.loggout();
  }
}
