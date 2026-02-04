import { Component, OnInit } from '@angular/core';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, personCircleOutline } from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-profil',
  imports: [IonButton, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonIcon, 
    CommonModule, 
    FormsModule,
    RouterLink 
  ],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
})
export class ProfilComponent  implements OnInit {

 constructor() {
    // On enregistre les icônes pour qu'elles s'affichent
    addIcons({ personOutline, personCircleOutline });
  }

  ngOnInit() {}

}