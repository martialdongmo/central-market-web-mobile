import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonProgressBar, IonIcon } from "@ionic/angular/standalone";
import { AuthService } from '../auth.service';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  lockClosedOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss'],
  imports: [IonContent, IonIcon],
})
export class CallbackComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(){
    addIcons({
      checkmarkCircleOutline,
      lockClosedOutline,
      shieldCheckmarkOutline
    })
  }




  async ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      try {
        await this.authService.exchangeCodeForToken(code);
        console.log('Navigating home...');
        this.router.navigate(['/catalog'], { replaceUrl: true });
      } catch (err) {
        console.error('❌ [Callback] Exchange code error:', err);
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    }
  }
}
