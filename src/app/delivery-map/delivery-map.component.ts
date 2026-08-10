import { Component, Output, EventEmitter } from '@angular/core';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-delivery-map',
  standalone: true,
  templateUrl: './delivery-map.component.html',
  styleUrl: './delivery-map.component.scss'
})
export class DeliveryMapComponent {
  @Output() locationChanged = new EventEmitter<{ lat: number; lng: number }>();

  constructor(private locationService: LocationService) {}

  onMarkerDragEnd(coords: { lat: number; lng: number }) {
    this.locationService.setLatitude(coords.lat);
    this.locationService.setLongitude(coords.lng);
    this.locationChanged.emit(coords);
  }
}