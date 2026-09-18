import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonIcon, NavController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, cartOutline, checkmarkCircle, storefrontOutline, alertCircleOutline } from 'ionicons/icons';
import { CatalogProductResponse } from 'src/app/core/model/response/catalogProductResponse';
import { CartService } from 'src/app/core/services/cart.service';
import { CustomCurrencyPipe } from 'src/app/core/services/custom.currency.pipe';


@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, IonIcon, CustomCurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {

  @Input() product!: CatalogProductResponse;

  private cartService = inject(CartService);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  constructor() {
    addIcons({ locationOutline, cartOutline, checkmarkCircle, storefrontOutline, alertCircleOutline });
  }

  /** Navigue vers la boutique sans déclencher le routerLink de la carte
   *  (qui ouvre le détail produit). Fonctionne identiquement sur web et
   *  APK : c'est une navigation Angular Router interne à l'app, pas un
   *  lien externe — aucun code spécifique plateforme n'est nécessaire. */
  goToShop(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    this.router.navigate(['/shop', this.product.shopId]);
  }

  async addToCart(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    const result = this.cartService.addToCart(this.product);

    switch (result.status) {
      case 'added':
      case 'quantity-updated':
        await this.showToast({
          message: `${this.product.productName} ajouté au panier`,
          color: 'dark',
          icon: 'checkmark-circle',
        });
        break;

      case 'currency-mismatch':
        await this.showToast({
          message: `Votre panier contient déjà des articles en ${result.cartCurrency}. `
            + `Videz-le pour ajouter un article en ${result.productCurrency}.`,
          color: 'danger',
          icon: 'alert-circle-outline',
          duration: 3000,
        });
        break;
    }
  }

  private async showToast(opts: { message: string; color: string; icon: string; duration?: number }) {
    const t = await this.toastCtrl.create({
      message: opts.message,
      duration: opts.duration ?? 1800,
      position: 'top',          // reste visible, jamais masqué par un footer/tab-bar
      mode: 'ios',
      color: opts.color,        // couleur Ionic valide (existe réellement)
      icon: opts.icon,
      cssClass: 'cart-toast',   // hook pour un style custom global (voir plus bas)
    });
    await t.present();
  }
}