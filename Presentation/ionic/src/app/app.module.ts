import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular/lazy';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { authInterceptor } from './interceptors/auth.interceptor';
import { LoginPage } from './login/login.page';
import { MedicosPage } from './medicos/medicos.page';
import { PacientesPage } from './pacientes/pacientes.page';
import { TabsPage } from './tabs/tabs.page';

@NgModule({
  declarations: [AppComponent, LoginPage, MedicosPage, PacientesPage, TabsPage],
  imports: [BrowserModule, CommonModule, FormsModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
