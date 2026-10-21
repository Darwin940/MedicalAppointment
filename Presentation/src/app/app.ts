import { Component, HostListener, signal } from '@angular/core';
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
  menuItems = signal<MenuItem[]>([
    {label: 'Inicio', icon: 'home', route:'home', rol :[0, 1 , 2, 3]},
    {label: 'Medicos', icon: 'group', route:'medico', rol : [0, 1, 3]},
    {label: 'Pacientes', icon: 'person', route:'paciente', rol :[0, 1]},
    {label: 'Nueva Cita', icon: 'directions_car', route:'cita', rol :[0, 1]},
    {label: 'Cancelar Cita', icon: 'build', route: 'cancelarcita', rol: [0, 1, 2]}
  ]);

  @HostListener("window:beforeunload") unloadHandler() {
    this.logOut();
  }

  logOut(){
  }

  logeado() : boolean {
    return true;
  }
}
