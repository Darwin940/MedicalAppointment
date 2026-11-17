import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { ApiService } from './api.service';
import { SessionService } from './session.service';

function makeToken(exp: number): string {
  const payload = btoa(JSON.stringify({
    sub: 17,
    username: 'admin',
    rol_id: 1,
    exp,
  }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `header.${payload}.signature`;
}

describe('ApiService', () => {
  let api: ApiService;
  let session: SessionService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(ApiService);
    session = TestBed.inject(SessionService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    session.clear();
  });

  it('sends doctor filters to the existing Business endpoint', () => {
    api.filterDoctors({ nombre: 'Ana', licencia: '' }).subscribe();

    const request = httpTesting.expectOne(
      (httpRequest) => httpRequest.url === `${environment.apiUrl}/medicos/filter/0/100`,
    );
    expect(request.request.params.get('nombre')).toBe('Ana');
    expect(request.request.params.has('licencia')).toBe(false);
    request.flush({ data: [], pagination: { offset: 0, limit: 100, total: 0 } });
  });

  it('stores the login tokens and attaches the access token to protected requests', () => {
    const tokens = {
      token: makeToken(Math.floor(Date.now() / 1000) + 3600),
      tkRef: 'refresh-token',
    };

    session.login({ username: 'admin', password: 'secret' }).subscribe();
    httpTesting.expectOne(`${environment.apiUrl}/auth/login`).flush(tokens);

    expect(session.user()).toEqual({ id: 17, username: 'admin', roleId: 1 });
    expect(session.isLoggedIn()).toBe(true);

    api.filterPatients().subscribe();
    const request = httpTesting.expectOne(`${environment.apiUrl}/pacientes/filter/0/100`);
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${tokens.token}`);
    request.flush({ data: [] });
  });

  it('renews an expired session and retries the protected request', () => {
    const oldTokens = { token: makeToken(1), tkRef: 'refresh-token' };
    const newTokens = {
      token: makeToken(Math.floor(Date.now() / 1000) + 3600),
      tkRef: 'new-refresh-token',
    };

    session.login({ username: 'admin', password: 'secret' }).subscribe();
    httpTesting.expectOne(`${environment.apiUrl}/auth/login`).flush(oldTokens);

    api.filterDoctors().subscribe();
    const failedRequest = httpTesting.expectOne(`${environment.apiUrl}/medicos/filter/0/100`);
    expect(failedRequest.request.headers.get('Authorization')).toBe(`Bearer ${oldTokens.token}`);
    failedRequest.flush({ error: 'Token expired' }, { status: 401, statusText: 'Unauthorized' });

    const refreshRequest = httpTesting.expectOne(`${environment.apiUrl}/auth/refresh-session/17`);
    expect(refreshRequest.request.method).toBe('POST');
    expect(refreshRequest.request.body).toEqual({ tkRef: oldTokens.tkRef });
    refreshRequest.flush(newTokens);

    const retry = httpTesting.expectOne(`${environment.apiUrl}/medicos/filter/0/100`);
    expect(retry.request.headers.get('Authorization')).toBe(`Bearer ${newTokens.token}`);
    retry.flush({ data: [] });
    expect(session.refreshToken).toBe(newTokens.tkRef);
  });
});
