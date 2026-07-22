import { HttpInterceptorFn, HttpEvent } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { TokenService } from '../token.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<any>> => {

  const tokenService = inject(TokenService);

  if (req.url.includes('/oauth2/token')) return next(req);
  if (req.url.includes('/auth')) return next(req);
  if (req.url.includes('/catalog')) return next(req);


  return from(tokenService.getAccessToken()).pipe(
    switchMap(token => {

      console.log('TOKEN:', token);

      const authReq = token
        ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
        : req;

      console.log('REQUEST HEADERS:', authReq.headers);

      return next(authReq).pipe(
        catchError(err => {

          if (err.status === 401) {

            return from(tokenService.refreshAccessToken()).pipe(
              switchMap(newToken => {

                if (!newToken) {
                  window.location.href = '/secure-app';
                  return throwError(() => err);
                }

                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });

                return next(retryReq);
              })
            );
          }

          return throwError(() => err);
        })
      );
    })
  );
};