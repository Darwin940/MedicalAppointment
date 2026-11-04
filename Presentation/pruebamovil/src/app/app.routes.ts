import { Routes } from '@angular/router';
import { authGuard } from './shared/helpers/guards/auth-guard';
import { Roles } from './shared/models/roles';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full'},
    { path: 'home',
        canActivate: [authGuard], data: {roles: [Roles.Admin, Roles.Medico, Roles.Paciente]},
        loadComponent: () => import('./components/home/home')
        .then(m => m.Home)
    },
    { path: 'login',
        loadComponent: () => import('./components/login/login')
        .then(m => m.Login)
    },
    { path: 'medico',
        canActivate: [authGuard], data: {roles: [Roles.Admin, Roles.Medico]},
        loadComponent: () => import('./components/medico-component/medico-component')
        .then(m => m.MedicoComponent)
    },
    { path: 'paciente',
        canActivate: [authGuard], data: {roles: [Roles.Admin, Roles.Medico]},
        loadComponent: () => import('./components/paciente-component/paciente-component')
        .then(m => m.PacienteComponent)
    },    
    { path: '**', loadComponent: () => import ('./components/error404-component/error404-component')
        .then(m => m.Error404Component)
    },    
];
