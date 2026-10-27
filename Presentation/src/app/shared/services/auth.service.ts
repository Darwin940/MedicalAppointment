import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of, tap } from 'rxjs';

import { IToken } from '../models/interfaces';
import { LoginForm } from '../models/interfaces';
import { TokenService } from './token.service';
import { User } from '../models/user-model';
import { environment } from '../../../environments/environment';

const API_URL = environment.servidor + '/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly srvTokens = inject(TokenService);
  private readonly router = inject(Router);
  public userActualS = signal(new User);

  public login(datos : LoginForm) {
    console.log(datos);
    return this.http.patch<IToken>(API_URL, datos)
      .pipe(
        tap((tokens) => {
          console.log(tokens);
          this.doLogin(tokens);
        }),
        map(() => true),
        catchError((error) => {
         console.log(error);
         return of (error.status);
        })
      );
  }

  public logout() {
    if (this.isLoggedIn()) {
      this.http.patch(`${API_URL}/logout/${this.userActual.cedula}`,{})
        .subscribe();      
      this.doLogOut();
    }
  }

  doLogin(tokens  : any) {
    this.srvTokens.setTokens(tokens);
    this.userActualS.set(this.userActual);
  }

  doLogOut() {
    if (this.srvTokens.token) {
      this.srvTokens.eliminarTokens();
    }
    this.userActualS.set(this.userActual);
    this.router.navigate(['/login']);
  }

  public isLoggedIn() : boolean {
    return !!this.srvTokens.token && !this.srvTokens.jwtTokenExp();
  }

  private get userActual() : User {
    if(!this.srvTokens.token) {
      return new User();
    } else {
      const tokenD = this.srvTokens.decodeToken();
      return new User({cedula: tokenD?.sub ?? '', nombre: tokenD?.nom ?? tokenD?.username ?? '', rol: tokenD?.rol ?? tokenD?.rol_id ?? -1 });
    }
  }

  public refreshSession() : any {
    if (this.isLoggedIn() && this.srvTokens.tokenTimeToExp() <= 20) {
      return this.http.patch<IToken>(`${API_URL}/refresh/${this.userActual.cedula}`, 
        {tkRef: this.srvTokens.refreshToken})
        .pipe(
          tap((tokens) => {
            this.doLogin(tokens);
          }),
          map(() => true),
          catchError((error) => {
            return of (error.status);
          })
        );
    }
  }
}
