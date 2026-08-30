import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom, APP_INITIALIZER } from '@angular/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { AuthInterceptor } from './app/auth/interceptors/auth.interceptor';

// ── i18n (ngx-translate v18+) ─────────────────────────────────────────
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

/**
 * Précharge les traductions ngx-translate AVANT que l'app ne démarre.
 * Cela évite l'affichage des clés ('menu.catalog', 'menu.orders', etc.)
 * pendant le chargement asynchrone des fichiers JSON.
 */
function initAppTranslations(translate: TranslateService): () => Promise<void> {
  return async () => {
    const savedLang = localStorage.getItem('preferred_language') ||
      (typeof navigator !== 'undefined' && navigator.language?.startsWith('fr') ? 'fr' : 'en');

    // Charger la langue par défaut
    await new Promise<void>((resolve) => {
      translate.reloadLang(savedLang).subscribe({
        next: () => resolve(),
        error: () => resolve()
      });
    });

    // Activer la langue
    translate.use(savedLang);
    localStorage.setItem('preferred_language', savedLang);

    console.log('[i18n] Translations preloaded, active lang:', savedLang);
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    // ngx-translate v18 functional providers
    provideTranslateService({}),
    provideTranslateHttpLoader({
      prefix: '/assets/i18n/',
      suffix: '.json'
    }),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [TranslateService],
      useFactory: (translate: TranslateService) => initAppTranslations(translate),
    },
  ],
});
