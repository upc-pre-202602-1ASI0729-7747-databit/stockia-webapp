import { computed, inject, Service, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NotificationsMessagingApi } from '../infrastructure/notifications-messaging-api';
import { Alert } from '../domain/model/alert.entity';

/**
 * State of Notifications &amp; Messaging: the alerts of the restaurant (newest first).
 * @author DataBit
 */
@Service()
export class NotificationsMessagingStore {
  private readonly alertsApi = inject(NotificationsMessagingApi);
  private readonly alertsSignal = signal<Alert[]>([]);
  private readonly loadingSignal = signal<boolean>(false);

  readonly alerts = this.alertsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly pendingAlerts = computed(() => this.alertsSignal().filter((alert) => alert.isPending));
  readonly recentAlerts = computed(() => this.alertsSignal().slice(0, 5));

  loadAlerts(): Promise<void> {
    this.loadingSignal.set(true);
    return firstValueFrom(this.alertsApi.getAlerts())
      .then((alerts) => this.alertsSignal.set(alerts))
      .finally(() => this.loadingSignal.set(false));
  }

  async saveAlert(alert: Alert): Promise<Alert> {
    const saved = await firstValueFrom(
      alert.id ? this.alertsApi.updateAlert(alert) : this.alertsApi.createAlert(alert),
    );
    this.alertsSignal.update((alerts) =>
      alert.id
        ? alerts.map((candidate) => (candidate.id === saved.id ? saved : candidate))
        : [saved, ...alerts],
    );
    return saved;
  }

  async deleteAlert(alert: Alert): Promise<void> {
    await firstValueFrom(this.alertsApi.deleteAlert(alert.id));
    this.alertsSignal.update((alerts) => alerts.filter((candidate) => candidate.id !== alert.id));
  }

  async retryDelivery(alert: Alert): Promise<Alert> {
    return this.replace(await firstValueFrom(this.alertsApi.retryDelivery(alert.id)));
  }

  async acknowledge(alert: Alert): Promise<Alert> {
    return this.replace(await firstValueFrom(this.alertsApi.acknowledge(alert.id)));
  }

  private replace(updated: Alert): Alert {
    this.alertsSignal.update((alerts) =>
      alerts.map((candidate) => (candidate.id === updated.id ? updated : candidate)),
    );
    return updated;
  }
}
