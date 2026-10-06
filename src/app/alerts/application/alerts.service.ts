import { Injectable, inject, signal, computed } from '@angular/core';
import { EMPTY, tap } from 'rxjs';
import { AlertsApiService } from '../infraestructure/alerts-api.service';
import { Alert, AlertChannel } from '../domain/alert.entity';
import { Recommendation } from '../domain/recommendation.entity';

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private api = inject(AlertsApiService);

  readonly alerts = signal<Alert[]>([]);
  readonly recommendations = signal<Recommendation[]>([]);
  readonly pendingCount = computed(() => this.alerts().filter((a) => !a.acknowledged).length);

  loadAlerts() {
    return this.api
      .getAlerts()
      .pipe(tap((alerts) => this.alerts.set(alerts.map((a) => Alert.fromJson(a)))));
  }

  /** Alta manual de una alerta (además de las que el sistema generaría automáticamente). */
  create(alert: Partial<Alert>) {
    return this.api.create(alert).pipe(tap(() => this.loadAlerts().subscribe()));
  }

  /** Edición completa de una alerta existente (tipo, severidad, mensaje, canal). */
  update(id: number, changes: Partial<Alert>) {
    const current = this.alerts().find((a) => a.id === id);
    const full = { ...current, ...changes, id };
    return this.api.update(id, full).pipe(tap(() => this.loadAlerts().subscribe()));
  }

  delete(id: number) {
    return this.api.delete(id).pipe(tap(() => this.loadAlerts().subscribe()));
  }

  acknowledge(id: number) {
    const alert = this.alerts().find((a) => a.id === id);
    if (!alert) return EMPTY;
    return this.api.acknowledge(alert).pipe(tap(() => this.loadAlerts().subscribe()));
  }

  /**
   * Simula un nuevo intento de entrega (AlertDelivered) sobre el canal indicado. Las alertas
   * CRITICAL requieren agotar WhatsApp + correo (ver Alert.requiredChannels en 4.6.5) antes de
   * considerarse gestionadas; esta acción agrega `channel` a deliveredChannels tras un intento
   * exitoso simulado.
   */
  retryDelivery(id: number, channel: AlertChannel) {
    const alert = this.alerts().find((a) => a.id === id);
    if (!alert || alert.deliveredChannels.includes(channel)) return EMPTY;
    const updated = new Alert(
      alert.id,
      alert.type,
      alert.severity,
      alert.message,
      alert.createdAt,
      alert.acknowledged,
      alert.channel,
      [...alert.deliveredChannels, channel],
    );
    return this.api.updateDeliveredChannels(updated).pipe(tap(() => this.loadAlerts().subscribe()));
  }

  loadRecommendations() {
    return this.api
      .getRecommendations()
      .pipe(tap((recs) => this.recommendations.set(recs.map((r) => Recommendation.fromJson(r)))));
  }

  markApplied(id: number) {
    const recommendation = this.recommendations().find((r) => r.id === id);
    if (!recommendation) return EMPTY;
    return this.api
      .markApplied(recommendation)
      .pipe(tap(() => this.loadRecommendations().subscribe()));
  }
}
