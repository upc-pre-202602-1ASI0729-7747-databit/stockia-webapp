import { Component, inject, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationsMessagingStore } from '../../../application/notifications-messaging.store';
import { Alert } from '../../../domain/model/alert.entity';
import { AlertForm } from '../../components/alert-form/alert-form';
import { AlertSeverityTag } from '../../components/alert-severity-tag/alert-severity-tag';
import { ConfirmDialog } from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';
import { NotificationService } from '../../../../shared/application/notification.service';
import { LanguageStore } from '../../../../shared/application/language.store';
import { LocalDatePipe } from '../../../../shared/presentation/pipes/local-date.pipe';

/**
 * Alerts (Alert Service): automatic stock and expiration alerts and manual ones. A delivery can be
 * retried on the pending channel; an alert is attended only after it was delivered.
 * @author DataBit
 */
@Component({
  selector: 'app-alerts-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    TranslatePipe,
    AlertSeverityTag,
    LocalDatePipe,
  ],
  templateUrl: './alerts-list.html',
  styles: `
    td.mat-mdc-cell,
    th.mat-mdc-header-cell {
      padding: 8px 12px;
    }
    .message {
      max-width: 380px;
    }
    .delivery {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .attended td {
      opacity: 0.6;
    }
  `,
})
export class AlertsList implements OnInit {
  protected readonly store = inject(NotificationsMessagingStore);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);
  private readonly language = inject(LanguageStore);
  protected readonly columns = ['type', 'message', 'severity', 'delivery', 'date', 'actions'];

  ngOnInit(): void {
    this.store.loadAlerts().catch((error) => this.notifications.error(error, 'errors.load'));
  }

  protected openForm(alert: Alert | null = null): void {
    this.dialog.open(AlertForm, { data: alert, width: '640px', maxWidth: '95vw' });
  }

  protected channelName(channel: string): string {
    return this.language.instant(`alerts.channel.${channel}`);
  }

  protected async retry(alert: Alert): Promise<void> {
    const channel = alert.pendingChannel;
    try {
      await this.store.retryDelivery(alert);
      this.notifications.success('alerts.retried', {
        channel: channel ? this.channelName(channel) : '',
      });
    } catch (error) {
      this.notifications.error(error);
    }
  }

  protected async acknowledge(alert: Alert): Promise<void> {
    try {
      await this.store.acknowledge(alert);
      this.notifications.success('alerts.acknowledged');
    } catch (error) {
      this.notifications.error(error);
    }
  }

  protected remove(alert: Alert): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: 'alerts.delete-title',
          message: 'alerts.delete-confirm',
          params: { message: alert.message },
        },
      })
      .afterClosed()
      .subscribe(async (accepted) => {
        if (!accepted) return;
        try {
          await this.store.deleteAlert(alert);
          this.notifications.success('alerts.deleted');
        } catch (error) {
          this.notifications.error(error, 'errors.delete');
        }
      });
  }
}
