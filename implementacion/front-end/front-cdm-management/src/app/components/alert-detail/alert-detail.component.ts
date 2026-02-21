import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { Alert, Location } from '../../models/alert.models';

@Component({
  selector: 'app-alert-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alert-detail.component.html',
  styleUrls: ['./alert-detail.component.css']
})
export class AlertDetailComponent implements OnInit {
  @ViewChild('map') mapElement!: ElementRef;

  alert: Alert | null = null;
  mode: 'view' | 'edit' | 'verify' | 'notify' = 'view';
  isLoading = true;
  mapReady = false;
  map: any;

  // Field disable states based on mode
  fieldsDisabled = {
    status: false,
    priority: false,
    notes: false
  };

  constructor(
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const alertId = this.route.snapshot.paramMap.get('id');
    const state = this.router.getCurrentNavigation()?.extras.state;
    this.mode = state?.['mode'] || 'view';

    if (alertId) {
      this.loadAlert(alertId);
    }

    this.setFieldsDisabledState();
  }

  private setFieldsDisabledState(): void {
    switch (this.mode) {
      case 'view':
        this.fieldsDisabled = { status: true, priority: true, notes: true };
        break;
      case 'verify':
        this.fieldsDisabled = { status: false, priority: true, notes: true };
        break;
      case 'notify':
        this.fieldsDisabled = { status: true, priority: true, notes: false };
        break;
      case 'edit':
        this.fieldsDisabled = { status: false, priority: false, notes: false };
        break;
    }
  }

  private loadAlert(id: string): void {
    this.alertService.getAlertById(id).subscribe({
      next: (alert) => {
        this.alert = alert;
        this.isLoading = false;
        setTimeout(() => this.initializeMap(), 100);
      },
      error: (error) => {
        console.error('Error loading alert:', error);
        this.isLoading = false;
      }
    });
  }

  private initializeMap(): void {
    if (this.mapReady || !this.alert) return;
    
    // Map initialization will be done using Google Maps API
    console.log('Map initialized for alert:', this.alert.id);
    this.mapReady = true;
    this.drawRoute();
  }

  private drawRoute(): void {
    // Draw the route using the location history to show the trajectory
    if (this.alert?.locationHistory && this.alert.locationHistory.length > 0) {
      const locations = this.alert.locationHistory.map(loc => ({
        lat: loc.latitude,
        lng: loc.longitude
      }));
      console.log('Drawing route with locations:', locations);
    }
  }

  getStatusColor(): string {
    if (!this.alert) return '';
    switch (this.alert.status) {
      case 'active':
        return '🔴 Activo';
      case 'review':
        return '🟡 En Revisión';
      case 'dispatched':
        return '🔵 Despachado';
      case 'resolved':
        return '🟢 Resuelto';
      default:
        return '';
    }
  }

  getPriorityColor(): string {
    if (!this.alert) return '';
    switch (this.alert.priority) {
      case 'critical':
        return '🔴 CRÍTICA';
      case 'high':
        return '🟠 ALTA';
      case 'medium':
        return '🟡 MEDIA';
      case 'low':
        return '🟢 BAJA';
      default:
        return '';
    }
  }

  updateAlertStatus(newStatus: Alert['status']): void {
    if (!this.alert || this.fieldsDisabled.status) return;

    this.alertService.updateAlertStatus(this.alert.id, newStatus).subscribe({
      next: (updated) => {
        this.alert = updated;
      },
      error: (error) => {
        console.error('Error updating status:', error);
      }
    });
  }

  updateAlert(): void {
    if (!this.alert) return;

    this.alertService.updateAlert(this.alert.id, this.alert).subscribe({
      next: (updated) => {
        this.alert = updated;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error updating alert:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getModeTitle(): string {
    switch (this.mode) {
      case 'view':
        return 'Ver Detalle';
      case 'edit':
        return 'Editar Alarma';
      case 'verify':
        return 'Verificar Alarma';
      case 'notify':
        return 'Notificar Autoridades';
      default:
        return 'Detalle de Alarma';
    }
  }

  getLocationHistory(): Location[] {
    return this.alert?.locationHistory || [];
  }

  hasEvidence(): boolean {
    return (this.alert?.evidenceUrls?.length || 0) > 0;
  }

  getNearbyAuthorities() {
    return this.alert?.nearbyAuthorities || [];
  }
}
