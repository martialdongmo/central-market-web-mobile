import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrdersService } from 'src/app/services/orders.service';
import { NavController } from '@ionic/angular/standalone';
import { ValidateOrderRequest } from 'src/app/model/requests/validate-order-request';
import { ValidateOrderComponent } from '../validate-order/validate-order.component';

@Component({
  selector: 'app-scan-order',
  templateUrl: './scan-order.component.html',
  styleUrls: ['./scan-order.component.scss'],
})
export class ScanOrderComponent implements OnInit {

  private route = inject(ActivatedRoute);
  public navCtrl = inject(NavController);
  private orderService = inject(OrdersService);
  loading = false;
  success = false;
  error: string | null = null;
  validationCode:string | null = null;

  constructor() { }

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    this.validationCode = code;
    
  }

  onScanner():void{
    const code = this.validationCode;
    if (code) {
      this.validate(code);
    } else {
      this.error = 'Erreur ';
    }
    
    this.validate(code);
  }


  validate(code: string) {
    this.loading = true;
    const req: ValidateOrderRequest = { validationCode: code };

    this.orderService.validateOrder(req).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Échec de la validation';
        console.error(err);
        this.loading = false;
      }
    });
  }

}
