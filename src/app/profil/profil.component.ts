import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs'; // Import Subscription
import { AuthService } from '../auth/auth.service';
import { UserResponse } from '../model/response/usersResponse';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonIcon],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
})
export class ProfilComponent implements OnInit, OnDestroy {
  user: UserResponse | null = null;
  isLoggedIn = false;
  isLoading = false;

  // Array to track open subscriptions manually
  private subs: Subscription[] = [];

  private authService = inject(AuthService);
  private navCtrl = inject(NavController);

  ngOnInit() {
    this.me();
  }

  // Clear memory when leaving the screen
  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  me(): void {
    this.isLoading = true;

    // Explicitly cast the Observable response type to <UserResponse>
    const userSub = this.authService.me().subscribe({
      next: (response: UserResponse) => {
        this.user = response;
        this.isLoggedIn = !!response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching user info:', err);
        this.isLoading = false;
        this.isLoggedIn = false;
      }
    });

    // Save subscription tracking reference
    this.subs.push(userSub);
  }

  logout() {
    this.navCtrl.navigateRoot('/login');
  }
}