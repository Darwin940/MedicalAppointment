import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, map, of, shareReplay, tap } from 'rxjs';

import { ApiService } from './api.service';
import { AppUser, TokenClaims, TokenResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly api = inject(ApiService);
  private readonly tokenKey = 'JWT_TOKEN';
  private readonly refreshKey = 'REFRESH_TOKEN';
  readonly user = signal<AppUser | null>(this.readUser());
  private refreshRequest: Observable<TokenResponse> | null = null;

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  isLoggedIn(): boolean {
    const token = this.token;
    if (!token) {
      return false;
    }
    const claims = this.decodeToken(token);
    return claims !== null && claims.exp * 1000 > Date.now();
  }

  login(credentials: { username: string; password: string }): Observable<TokenResponse> {
    return this.api.login(credentials).pipe(tap((tokens) => this.saveTokens(tokens)));
  }

  refreshSession(): Observable<TokenResponse> {
    const user = this.user();
    const refreshToken = this.refreshToken;
    if (!user || !refreshToken) {
      throw new Error('No hay una sesión que se pueda renovar.');
    }
    if (this.refreshRequest) {
      return this.refreshRequest;
    }

    this.refreshRequest = this.api.refreshSession(user.id, refreshToken).pipe(
      tap((tokens) => this.saveTokens(tokens)),
      shareReplay({ bufferSize: 1, refCount: false }),
      finalize(() => {
        this.refreshRequest = null;
      }),
    );
    return this.refreshRequest;
  }

  logout(): Observable<void> {
    const user = this.user();
    if (!user) {
      this.clear();
      return of(undefined);
    }

    return this.api.logout(user.id).pipe(
      map(() => undefined),
      finalize(() => this.clear()),
    );
  }

  clear(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    this.user.set(null);
  }

  private saveTokens(tokens: TokenResponse): void {
    localStorage.setItem(this.tokenKey, tokens.token);
    localStorage.setItem(this.refreshKey, tokens.tkRef);
    this.user.set(this.readUser());
  }

  private readUser(): AppUser | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      return null;
    }
    const claims = this.decodeToken(token);
    const id = Number(claims?.sub);
    if (!claims || !Number.isInteger(id) || id < 1 || !claims.username || !claims.rol_id) {
      return null;
    }
    return { id, username: claims.username, roleId: Number(claims.rol_id) };
  }

  private decodeToken(token: string): TokenClaims | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(normalized)) as TokenClaims;
    } catch {
      return null;
    }
  }
}
