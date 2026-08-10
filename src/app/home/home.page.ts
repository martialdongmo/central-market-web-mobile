import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonSegmentContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonSegmentContent, FormsModule],
})
export class HomePage {
  selectedFilter: string = 'all';

  constructor() {}

  changeFilter(event: any) {
    this.selectedFilter = event.detail.value;
  }
}