import { HttpInterceptorFn, HttpEvent } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../token.service';
import { environment } from 'src/environments/environment.development';

/** Route de la page login / passerelle OAuth2 (voir routes.ts). */
const LOGIN_GATEWAY_ROUTE = '/secure-app';

/** Requêtes qui ne doivent jamais recevoir de header Authorization ni
 *  déclencher de refresh/redirect en cas de 401 : token endpoint (évite
 *  une boucle), tout /auth (login, register, otp, forgot/reset password),
 *  et le catalogue — le backend n'exige pas de token, un visiteur non
 *  connecté doit pouvoir consulter les articles librement. */
function isPublicRequest(url: string): boolean {
  return (
    url.includes('/oauth2/token') ||
    url.includes('/auth') ||
    url.startsWith(environment.CATALOG_API_URL)
  );
}

export const AuthInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<any>> => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const zone = inject(NgZone);

  if (isPublicRequest(req.url)) {
    return next(req);
  }

  return from(tokenService.getAccessToken()).pipe(
    switchMap(token => {
      const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

      return next(authReq).pipe(
        catchError(err => {
          if (err.status === 401) {
            // Si aucun token n'existait avant cette requête, l'utilisateur
            // est un simple visiteur non connecté — pas de refresh à
            // tenter (il n'y a pas de refresh token), et surtout PAS de
            // redirection forcée vers le login. Il doit pouvoir continuer
            // à naviguer normalement (ex: consulter le catalogue) même si
            // un appel annexe (panier, notifications...) échoue en 401.
            if (!token) {
              return throwError(() => err);
            }

            return from(tokenService.refreshAccessToken()).pipe(
              switchMap(newToken => {
                if (!newToken) {
                  // Ici, un token existait et n'est plus valide : c'est
                  // une vraie session expirée, la redirection est justifiée.
                  zone.run(() => {
                    router.navigateByUrl(LOGIN_GATEWAY_ROUTE, { replaceUrl: true });
                  });
                  return throwError(() => err);
                }

                const retryReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                });

                return next(retryReq);
              }),
            );
          }

          return throwError(() => err);
        }),
      );
    }),
  );
};