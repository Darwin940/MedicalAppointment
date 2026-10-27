import { Component, HostListener, signal, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from './shared/services/auth.service';

type MenuItem = {
  label : string;
  icon : string;
  route : string;
  rol : number[];
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule,
    MatToolbarModule, MatMenuModule, MatSidenavModule, MatCheckboxModule, 
    MatFormFieldModule, MatIconModule, MatDividerModule, MatListModule,
    MatTableModule, MatTooltipModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Presentation');
  protected readonly authService = inject(AuthService);
  menuItems = signal<MenuItem[]>([
    {label: 'Inicio', icon: 'home', route:'home', rol :[0, 1 , 2, 3]},
    {label: 'Medicos', icon: 'group', route:'medico', rol : [0, 1, 3]},
    {label: 'Pacientes', icon: 'person', route:'paciente', rol :[0, 1]},
    {label: 'Nueva Cita', icon: 'calendar_month', route:'cita', rol :[0, 1]},
    {label: 'Cancelar Cita', icon: 'event_busy', route: 'cancelarcita', rol: [0, 1, 2]}
  ]);

  @HostListener("window:beforeunload") unloadHandler() {
    this.logout();
  }

  logout(){
    this.authService.logout();
  }

  logeado() : boolean {
    return this.authService.isLoggedIn();
  }
}
