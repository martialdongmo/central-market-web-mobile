import { Component, OnInit } from '@angular/core';
import { addIcons } from 'ionicons';
import { personOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';
import { 
  IonContent, IonHeader, IonToolbar, IonButtons, 
  IonBackButton, IonInput, IonButton, IonIcon } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [IonHeader, IonInput, IonButton, RouterModule, IonToolbar, IonButtons, IonBackButton, IonContent, IonIcon],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent  implements OnInit {

  constructor() {
    addIcons({ personOutline, mailOutline, lockClosedOutline });
   }

  ngOnInit() {}

}