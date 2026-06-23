
import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp, IonRouterOutlet, IonTabBar, IonTabButton,
  IonIcon, IonLabel, NavController,AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';


import { Subscription } from 'rxjs';

import { AuthService } from './auth/auth.service';
import { UserResponse } from './model/response/usersResponse';


const ROLE_DELIVERY = 'DELIVERY';
const ROLE_ADMIN    = 'ADMIN';
const ROLE_MANAGER  = 'MANAGER';
 
/** Roles that may validate / confirm delivery orders */
const CAN_VALIDATE_ROLES: string[] = [ROLE_DELIVERY, ROLE_ADMIN, ROLE_MANAGER];
 
/** External shop-creation portal */
const CREATE_SHOP_URL = 'https://kapexpert.cloud:3001/create-shop';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonApp,
    IonRouterOutlet,
  ],
})

export class AppComponent {

}