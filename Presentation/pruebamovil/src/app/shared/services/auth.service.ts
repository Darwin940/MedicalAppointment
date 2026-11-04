import { HttpClient } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of, tap } from 'rxjs';

import { IToken } from '../models/interfaces';
import { LoginForm } from '../models/interfaces';
import { TokenService } from './token.service';
import { User } from '../models/user-model';
import { environment } from '../../../environments/environment';

const API_URL = environment.servidor + '/auth';

@Service()

export class AuthService {

  private http = inject(HttpClient);
  private readonly srvTokens = inject(TokenService);
  private readonly router = inject(Router);
  public userActualS = signal(new User);

  public login(datos : LoginForm) {
    return this.http.post<IToken>(`${API_URL}/login`, datos)
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
  public loggout() {
    if (this.isLoggedIn()) {
      this.http.delete(`${API_URL}/loggout/${this.userActual.id}`,{})
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
      this.srvTokens.removeTokens();
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
      return new User({id: tokenD.sub, username: tokenD.username, rol_id: tokenD.rol_id });
    }
  }
  public refreshSession() : any {
    if (this.isLoggedIn() && this.srvTokens.tokenTimeToExp() <= 20) {
      return this.http.patch<IToken>(`${API_URL}/refresh/${this.userActual.id}`,
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
