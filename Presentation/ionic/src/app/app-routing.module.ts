import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { LoginPage } from './login/login.page';
import { MedicosPage } from './medicos/medicos.page';
import { PacientesPage } from './pacientes/pacientes.page';
import { TabsPage } from './tabs/tabs.page';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tabs/home' },
  { path: 'login', component: LoginPage },
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadChildren: () => import('./home/home.module').then((module) => module.HomePageModule),
      },
      {
        path: 'medicos',
        component: MedicosPage,
        canActivate: [authGuard],
        data: { roles: [1, 2] },
      },
      {
        path: 'pacientes',
        component: PacientesPage,
        canActivate: [authGuard],
        data: { roles: [1, 2] },
      },
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },
  { path: '**', redirectTo: 'tabs/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
