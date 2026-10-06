import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AlertsService } from '../../application/alerts.service';
import {
  Alert,
  AlertSeverity,
  AlertType,
  AlertChannel,
  ALERT_TYPE_LABEL,
} from '../../domain/alert.entity';

@Component({
  selector: 'app-alerts-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './alerts-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './alerts-list.component.css',
})
export class AlertsListComponent implements OnInit {
  private fb = inject(FormBuilder);
  alertsSrv = inject(AlertsService);
  typeLabel = ALERT_TYPE_LABEL;
  Severity = AlertSeverity;
  types = Object.values(AlertType);
  severities = Object.values(AlertSeverity);

  showForm = signal(false);
  editingId = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    type: [AlertType.LOW_STOCK, Validators.required],
    severity: [AlertSeverity.WARNING, Validators.required],
    message: ['', [Validators.required, Validators.minLength(5)]],
    channel: ['WHATSAPP' as AlertChannel, Validators.required],
  });

  ngOnInit() {
    this.alertsSrv.loadAlerts().subscribe();
  }

  severityClass(alert: Alert) {
    switch (alert.severity) {
      case AlertSeverity.CRITICAL:
        return 'badge badge-danger';
      case AlertSeverity.WARNING:
        return 'badge badge-warning';
      default:
        return 'badge badge-muted';
    }
  }

  acknowledge(alert: Alert) {
    this.alertsSrv.acknowledge(alert.id).subscribe();
  }

  retryDelivery(alert: Alert) {
    const channel = alert.pendingChannel;
    if (!channel) return;
    this.alertsSrv.retryDelivery(alert.id, channel).subscribe();
  }

  channelLabel(channel: 'WHATSAPP' | 'EMAIL') {
    return channel === 'WHATSAPP' ? 'WhatsApp' : 'Correo';
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({
      type: AlertType.LOW_STOCK,
      severity: AlertSeverity.WARNING,
      message: '',
      channel: 'WHATSAPP',
    });
    this.showForm.set(true);
  }

  openEdit(alert: Alert) {
    this.editingId.set(alert.id);
    this.form.setValue({
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      channel: alert.channel,
    });
    this.showForm.set(true);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const id = this.editingId();
    const request = id
      ? this.alertsSrv.update(id, raw)
      : this.alertsSrv.create({
          ...raw,
          createdAt: new Date().toISOString(),
          acknowledged: false,
          deliveredChannels: [raw.channel],
        });
    request.subscribe(() => this.showForm.set(false));
  }

  remove(alert: Alert) {
    if (confirm(`¿Eliminar la alerta "${alert.message}"?`)) {
      this.alertsSrv.delete(alert.id).subscribe();
    }
  }
}
