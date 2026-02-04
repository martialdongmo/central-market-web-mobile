import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonButtons, 
  IonBackButton, IonInput, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline } from 'ionicons/icons';
@Component({
  selector: 'app-login',
  imports: [IonIcon, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonInput, IonButton,RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent  implements OnInit {

  constructor() { 
    addIcons({ mailOutline, lockClosedOutline });
  }

  ngOnInit() {}

}