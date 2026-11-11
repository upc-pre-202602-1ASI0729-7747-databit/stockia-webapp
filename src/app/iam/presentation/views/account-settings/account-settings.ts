import {Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';
import {NotificationService} from '../../../../shared/application/notification.service';
import {ErrorMessagePipe} from '../../../../shared/presentation/pipes/error-message.pipe';
import {AppValidators} from '../../../../shared/presentation/validators';
import {RestaurantForm} from '../../../../restaurant-registration/presentation/components/restaurant-form/restaurant-form';
import {SubscriptionSummary} from '../../../../subscription-payments/presentation/components/subscription-summary/subscription-summary';

/**
 * Account settings: profile, restaurant data, subscription type (Administrator) and password change.
 * @author DataBit
 */
@Component({
  selector: 'app-account-settings',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslatePipe, ErrorMessagePipe,
    RestaurantForm, SubscriptionSummary],
  templateUrl: './account-settings.html',
  styles: `.grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); }
    form { display: flex; flex-direction: column; }`
})
export class AccountSettings implements OnInit {
  protected readonly iamStore = inject(IamStore);
  private readonly notifications = inject(NotificationService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly savingProfile = signal(false);
  protected readonly savingPassword = signal(false);
  protected readonly profileForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, AppValidators.email]]
  });
  protected readonly passwordForm = this.formBuilder.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, AppValidators.strongPassword]],
    confirmPassword: ['', [Validators.required, AppValidators.matches('newPassword')]]
  });

  ngOnInit(): void {
    const user = this.iamStore.currentUser();
    if (user) this.profileForm.setValue({fullName: user.fullName, email: user.email});
  }

  protected async saveProfile(): Promise<void> {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid || this.savingProfile()) return;
    this.savingProfile.set(true);
    try {
      const {fullName, email} = this.profileForm.getRawValue();
      await this.iamStore.updateProfile(fullName, email);
      this.notifications.success('settings.profile.saved');
    } catch (error) {
      this.notifications.error(error, 'settings.profile.error');
    } finally {
      this.savingProfile.set(false);
    }
  }

  protected async changePassword(): Promise<void> {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid || this.savingPassword()) return;
    this.savingPassword.set(true);
    try {
      const {currentPassword, newPassword} = this.passwordForm.getRawValue();
      await this.iamStore.changePassword(currentPassword, newPassword);
      this.notifications.success('settings.password.saved');
      this.passwordForm.reset();
    } catch (error) {
      this.notifications.error(error, 'settings.password.error');
    } finally {
      this.savingPassword.set(false);
    }
  }
}
