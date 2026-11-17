import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionService } from '../services/session.service';

export const authGuard: CanActivateFn = (route) => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (!session.isLoggedIn()) {
    session.clear();
    return router.parseUrl('/login');
  }

  const allowedRoles = route.data['roles'] as number[] | undefined;
  const user = session.user();
  return !allowedRoles || (user !== null && allowedRoles.includes(user.roleId))
    ? true
    : router.parseUrl('/tabs/home');
};
