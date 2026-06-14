import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';


@Component({ selector: 'app-nearby',
   standalone: true,
    imports: [CommonModule, IonContent, IonIcon], 
    templateUrl: './nearby.component.html',
     styleUrls: ['./nearby.component.scss'] })
export class NearbyComponent implements OnInit {
 ngOnInit(): void {
     
 }
}
