import { Routes } from '@angular/router';
import { MedicoComponent } from './components/medico-component/medico-component';

export const routes: Routes = [
  { path: '', redirectTo: 'medico', pathMatch: 'full' },

  { path: 'medico', component: MedicoComponent },


];

  // Aquí podrás agregar las demás conforme crees sus componentes:
  // { path: 'home', component: HomeComponent },
  // { path: 'paciente', component: PacienteComponent },
  // { path: 'cita', component: CitaComponent },
  // { path: 'cancelarcita', component: CancelarCitaComponent },
