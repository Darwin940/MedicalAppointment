import { HttpInterceptorFn } from '@angular/common/http';
import { TokenService } from '../../services/token.service';
import { inject } from '@angular/core';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenService).token;
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req);
};
