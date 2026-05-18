import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router      = inject(Router);
  const tokenService = inject(TokenService);
  // const shops       = inject(Shops);

  // Demo mode bypasses auth entirely
  // if (shops.demoMode()) return true;

  return tokenService.getAccessToken().then(token => {
    if (token) return true;
    router.navigate(['/secure-app']);
    return false;
  });
};