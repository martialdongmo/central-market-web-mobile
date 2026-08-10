import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { Subject, filter, takeUntil } from 'rxjs';

const ROUTES_WITHOUT_GLOBAL_BACK = new Set([
  '',
  'catalog',
  'secure-app',
  'callback',
  'verify-otp',
  'details/:productId',
  'checkout',
  'orders',
  'order-tracking/:id',
  'order-confirmation/:orderId',
  'become-delivery',
  '**',
]);

@Component({
  selector: 'app-back-navigation',
  standalone: true,
  imports: [IonIcon],
  template: `
    @if (showBackButton) {
      <button
        type="button"
        class="global-back-button"
        aria-label="Back"
        title="Back"
        (click)="goBack()"
      >
        <ion-icon name="arrow-back-outline" aria-hidden="true"></ion-icon>
      </button>
    }
  `,
  styles: [
    `
      :host {
        position: fixed;
        top: calc(env(safe-area-inset-top, 0px) + 10px);
        left: 12px;
        z-index: 10000;
        pointer-events: none;
      }

      .global-back-button {
        display: grid;
        width: 42px;
        height: 42px;
        padding: 0;
        border: 1px solid rgb(226 232 240 / 90%);
        border-radius: 50%;
        background: rgb(255 255 255 / 94%);
        box-shadow:
          0 8px 24px rgb(15 23 42 / 14%),
          0 1px 4px rgb(15 23 42 / 10%);
        color: #1e3a8a;
        cursor: pointer;
        place-items: center;
        pointer-events: auto;
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
        -webkit-tap-highlight-color: transparent;
        transition:
          transform 0.12s ease,
          background 0.12s ease;
      }

      .global-back-button ion-icon {
        font-size: 22px;
        pointer-events: none;
      }

      .global-back-button:active {
        background: #eff6ff;
        transform: scale(0.93);
      }

      .global-back-button:focus-visible {
        outline: 3px solid rgb(59 130 246 / 35%);
        outline-offset: 2px;
      }
    `,
  ],
})
export class AppBackNavigationComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly navController = inject(NavController);
  private readonly destroy$ = new Subject<void>();

  private currentUrl = this.router.url;
  private previousInternalUrl: string | null = null;
  private hasCompletedInitialNavigation = this.router.navigated;

  showBackButton = false;

  constructor() {
    addIcons({ arrowBackOutline });
  }

  ngOnInit(): void {
    this.updateVisibility();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event) => {
        const nextUrl = event.urlAfterRedirects;

        if (!this.hasCompletedInitialNavigation) {
          this.currentUrl = nextUrl;
          this.hasCompletedInitialNavigation = true;
        } else if (nextUrl !== this.currentUrl) {
          this.previousInternalUrl = this.currentUrl;
          this.currentUrl = nextUrl;
        }

        this.updateVisibility();
      });
  }

  goBack(): void {
    if (this.previousInternalUrl && this.previousInternalUrl !== this.currentUrl) {
      this.navController.back();
      return;
    }

    void this.router.navigateByUrl('/catalog', { replaceUrl: true });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateVisibility(): void {
    const activeRoutePath = this.getActiveRoutePath();
    this.showBackButton = !ROUTES_WITHOUT_GLOBAL_BACK.has(activeRoutePath);
  }

  private getActiveRoutePath(): string {
    let route = this.router.routerState.snapshot.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    return route.routeConfig?.path ?? '';
  }
}