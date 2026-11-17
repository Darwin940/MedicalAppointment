import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { SessionService } from '../services/session.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionService);
  const isAuthRequest = request.url.startsWith(`${environment.apiUrl}/auth/`);
  const token = session.token;
  const authorized = token && !isAuthRequest
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorized).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        isAuthRequest ||
        !session.refreshToken
      ) {
        return throwError(() => error);
      }

      return session.refreshSession().pipe(
        switchMap((tokens) => next(request.clone({
          setHeaders: { Authorization: `Bearer ${tokens.token}` },
        }))),
        catchError((refreshError: unknown) => {
          session.clear();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
