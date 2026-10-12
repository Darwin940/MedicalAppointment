import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FrmMedico } from './components/forms/frm-medico/frm-medico';
import { MedicoComponent } from './components/medico-component/medico-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FrmMedico, MedicoComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Presentation');
}
