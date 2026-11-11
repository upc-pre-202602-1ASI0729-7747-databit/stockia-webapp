import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {RestaurantRegistrationStore} from '../../../application/restaurant-registration.store';
import {Restaurant} from '../../../domain/model/restaurant.entity';
import {IamStore} from '../../../../iam/application/iam.store';
import {NotificationService} from '../../../../shared/application/notification.service';
import {ErrorMessagePipe} from '../../../../shared/presentation/pipes/error-message.pipe';
import {AppValidators} from '../../../../shared/presentation/validators';

/**
 * Restaurant data (Profile Management): every member reads it, only the Administrator changes it.
 * @author DataBit
 */
@Component({
  selector: 'app-restaurant-form',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslatePipe, ErrorMessagePipe],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header><mat-card-title>{{ 'settings.restaurant.title' | translate }}</mat-card-title>
        <mat-card-subtitle>{{ 'settings.restaurant.description' | translate }}</mat-card-subtitle></mat-card-header>
      <mat-card-content>
        @if (!iamStore.isAdmin()) { <p class="muted">{{ 'settings.restaurant.read-only' | translate }}</p> }
        <form [formGroup]="form" (ngSubmit)="save()" novalidate>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'fields.restaurant-name' | translate }}</mat-label>
            <input matInput formControlName="name" required>
            <mat-error>{{ form.controls.name | errorMessage }}</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'fields.restaurant-address' | translate }}</mat-label>
            <input matInput formControlName="address" [placeholder]="'placeholders.restaurant-address' | translate">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'fields.restaurant-phone' | translate }}</mat-label>
            <input matInput type="tel" formControlName="phone" [placeholder]="'placeholders.restaurant-phone' | translate">
            <mat-error>{{ form.controls.phone | errorMessage }}</mat-error>
          </mat-form-field>
          @if (iamStore.isAdmin()) {
            <div class="form-actions"><button mat-flat-button type="submit" [disabled]="saving()">{{ 'common.save-changes' | translate }}</button></div>
          }
        </form>
      </mat-card-content>
    </mat-card>`,
  styles: `form { display: flex; flex-direction: column; }`
})
export class RestaurantForm implements OnInit {
  protected readonly iamStore = inject(IamStore);
  private readonly registrationStore = inject(RestaurantRegistrationStore);
  private readonly notifications = inject(NotificationService);
  protected readonly saving = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    address: [''],
    phone: ['', AppValidators.optionalPhone]
  });

  constructor() {
    effect(() => {
      const restaurant = this.registrationStore.restaurant();
      if (restaurant) this.form.setValue({name: restaurant.name, address: restaurant.address, phone: restaurant.phone});
      if (!this.iamStore.isAdmin()) this.form.disable();
    });
  }

  ngOnInit(): void {
    this.registrationStore.loadRestaurant().catch(error => this.notifications.error(error, 'errors.load'));
  }

  protected async save(): Promise<void> {
    this.form.markAllAsTouched();
    const current = this.registrationStore.restaurant();
    if (this.form.invalid || !current || this.saving()) return;
    this.saving.set(true);
    try {
      const {name, address, phone} = this.form.getRawValue();
      await this.registrationStore.updateRestaurant(new Restaurant(current.id, name, address, phone, current.latitude, current.longitude));
      this.notifications.success('settings.restaurant.saved');
    } catch (error) {
      this.notifications.error(error, 'settings.restaurant.error');
    } finally {
      this.saving.set(false);
    }
  }
}
