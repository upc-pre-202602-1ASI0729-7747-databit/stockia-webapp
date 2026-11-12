import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Alert,
  ALERT_CHANNELS,
  ALERT_SEVERITIES,
  ALERT_TYPES,
  AlertChannel,
  AlertSeverity,
  AlertType,
} from '../../../domain/model/alert.entity';
import { NotificationsMessagingStore } from '../../../application/notifications-messaging.store';
import { NotificationService } from '../../../../shared/application/notification.service';
import { ErrorMessagePipe } from '../../../../shared/presentation/pipes/error-message.pipe';

/**
 * Dialog to create or edit a manual alert (critical alerts are delivered by WhatsApp and email).
 * @author DataBit
 */
@Component({
  selector: 'app-alert-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    TranslatePipe,
    ErrorMessagePipe,
  ],
  template: ` <h2 mat-dialog-title>{{ (alert ? 'alerts.edit' : 'alerts.new') | translate }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()" novalidate>
      <mat-dialog-content>
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'alerts.fields.type' | translate }}</mat-label>
            <mat-select formControlName="type">
              @for (type of types; track type) {
                <mat-option [value]="type">{{ 'alerts.type.' + type | translate }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'alerts.fields.severity' | translate }}</mat-label>
            <mat-select formControlName="severity">
              @for (severity of severities; track severity) {
                <mat-option [value]="severity">{{
                  'alerts.severity.' + severity | translate
                }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'alerts.fields.channel' | translate }}</mat-label>
            <mat-select formControlName="channel">
              @for (channel of channels; track channel) {
                <mat-option [value]="channel">{{
                  'alerts.channel.' + channel | translate
                }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        @if (form.controls.severity.value === 'CRITICAL') {
          <p class="muted">{{ 'alerts.hints.critical-channels' | translate }}</p>
        }
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'alerts.fields.message' | translate }}</mat-label>
          <textarea
            matInput
            formControlName="message"
            rows="3"
            required
            [placeholder]="'alerts.placeholders.message' | translate"
          ></textarea>
          <mat-error>{{ form.controls.message | errorMessage }}</mat-error>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>{{ 'common.cancel' | translate }}</button>
        <button mat-flat-button type="submit" [disabled]="saving()">
          {{ (alert ? 'common.save' : 'alerts.create') | translate }}
        </button>
      </mat-dialog-actions>
    </form>`,
})
export class AlertForm {
  protected readonly alert = inject<Alert | null>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AlertForm>);
  private readonly store = inject(NotificationsMessagingStore);
  private readonly notifications = inject(NotificationService);
  protected readonly types = ALERT_TYPES;
  protected readonly severities = ALERT_SEVERITIES;
  protected readonly channels = ALERT_CHANNELS;
  protected readonly saving = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    type: [this.alert?.type ?? ('IOT_FAULT' as AlertType)],
    severity: [this.alert?.severity ?? ('WARNING' as AlertSeverity)],
    channel: [this.alert?.channel ?? ('WHATSAPP' as AlertChannel)],
    message: [this.alert?.message ?? '', [Validators.required, Validators.minLength(5)]],
  });

  protected async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    try {
      await this.store.saveAlert(
        new Alert({ ...this.form.getRawValue(), id: this.alert?.id ?? 0 }),
      );
      this.notifications.success(this.alert ? 'alerts.updated' : 'alerts.created');
      this.dialogRef.close(true);
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.saving.set(false);
    }
  }
}
