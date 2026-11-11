import {Component, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {RestaurantRegistrationStore} from '../../../application/restaurant-registration.store';
import {RegisterRestaurantCommand} from '../../../domain/model/register-restaurant.command';
import {AuthLayout} from '../../../../shared/presentation/components/auth-layout/auth-layout';
import {ErrorMessagePipe} from '../../../../shared/presentation/pipes/error-message.pipe';
import {AppValidators} from '../../../../shared/presentation/validators';
import {NotificationService} from '../../../../shared/application/notification.service';

/**
 * Restaurant sign-up (Restaurant Onboarding): the owner becomes the first Administrator, the
 * restaurant starts on the free plan and the session opens on the dashboard.
 * @author DataBit
 */
@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslatePipe, AuthLayout, ErrorMessagePipe],
  templateUrl: './sign-up.html',
  styleUrl: '../../../../iam/presentation/views/sign-in/sign-in.css'
})
export class SignUp {
  private readonly registrationStore = inject(RestaurantRegistrationStore);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  protected readonly submitting = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    restaurantName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, AppValidators.email]],
    password: ['', [Validators.required, AppValidators.strongPassword]],
    confirmPassword: ['', [Validators.required, AppValidators.matches('password')]]
  });

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    try {
      const {fullName, restaurantName, email, password} = this.form.getRawValue();
      const owner = await this.registrationStore.register(new RegisterRestaurantCommand(fullName, restaurantName, email, password));
      this.notifications.success('auth.sign-up.welcome', {name: owner.fullName});
      await this.router.navigate(['/app/dashboard']);
    } catch (error) {
      this.notifications.error(error, 'auth.sign-up.error');
    } finally {
      this.submitting.set(false);
    }
  }
}
