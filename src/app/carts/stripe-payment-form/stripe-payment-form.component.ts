import { 
  Component, 
  EventEmitter, 
  Output, 
  Input, 
  inject, 
  OnInit, 
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonIcon, 
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cardOutline, 
  alertCircleOutline,
  lockClosedOutline
} from 'ionicons/icons';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment.development';

// Extend environment interface to include stripePublishableKey
declare module 'src/environments/environment.development' {
  interface Environment {
    stripePublishableKey: string;
  }
}

@Component({
  selector: 'app-stripe-payment-form',
  standalone: true,
  imports: [CommonModule, IonIcon, IonSpinner],
  templateUrl: './stripe-payment-form.component.html',
  styleUrls: ['./stripe-payment-form.component.scss']
})
export class StripePaymentFormComponent implements OnInit, OnDestroy, AfterViewInit {
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('cardElement', { static: true }) cardElementRef!: ElementRef;
  
  @Input() amount: number = 0;
  @Input() currency: string = 'XAF';
  @Input() clientSecret: string = '';
  @Output() paymentSuccess = new EventEmitter<string>();
  @Output() paymentError = new EventEmitter<string>();
  @Output() loadingChange = new EventEmitter<boolean>();

  stripe: Stripe | null = null;
  elements: any = null;
  cardElement: any = null;
  
  isLoading = false;
  errorMessage = '';
  cardComplete = false;
  cardError = '';

  // Trigger payment from parent
  async processPayment() {
    if (this.clientSecret) {
      await this.confirmPayment(this.clientSecret);
    }
  }

  ngOnInit() {
    addIcons({ cardOutline, alertCircleOutline, lockClosedOutline });
  }

  async ngAfterViewInit() {
    // Initialize Stripe
    this.stripe = await loadStripe(environment.stripePublishableKey);
    
    if (this.stripe && this.cardElementRef?.nativeElement) {
      this.elements = this.stripe.elements();
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontFamily: 'Inter, sans-serif',
            fontSmoothTo: 'antialiased',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: '500',
            color: '#1a1a1a',
            '::placeholder': {
              color: '#a0a0a0',
            },
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a',
          },
        },
      });
      
      // Mount the card element
      this.cardElement.mount(this.cardElementRef.nativeElement);
      this.cardElement.on('change', (event: any) => {
        this.cardError = event.error?.message || '';
        this.cardComplete = event.complete;
        this.cdr.markForCheck();
      });
    }
  }

  ngOnDestroy() {
    if (this.cardElement) {
      this.cardElement.destroy();
    }
  }

  async confirmPayment(clientSecret: string) {
    if (!this.stripe || !this.cardElement) {
      this.paymentError.emit('Stripe not initialized');
      return;
    }

    this.isLoading = true;
    this.loadingChange.emit(true);
    this.errorMessage = '';

    try {
      const { error, paymentMethod } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.cardElement,
      });

      if (error) {
        this.cardError = error.message || 'Payment method creation failed';
        this.paymentError.emit(this.cardError);
        this.isLoading = false;
        this.loadingChange.emit(false);
        return;
      }

      // Confirm the payment with the payment method
      const { error: confirmError } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod?.id,
      });

      if (confirmError) {
        this.errorMessage = confirmError.message || 'Payment confirmation failed';
        this.paymentError.emit(this.errorMessage);
      } else {
        this.paymentSuccess.emit(paymentMethod?.id || '');
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'An unexpected error occurred';
      this.paymentError.emit(this.errorMessage);
    } finally {
      this.isLoading = false;
      this.loadingChange.emit(false);
    }
  }
}