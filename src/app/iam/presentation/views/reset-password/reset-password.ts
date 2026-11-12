import {Component, effect, inject, input, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';
import {AuthLayout} from '../../../../shared/presentation/components/auth-layout/auth-layout';
import {ErrorMessagePipe} from '../../../../shared/presentation/pipes/error-message.pipe';
import {AppValidators} from '../../../../shared/presentation/validators';
import {NotificationService} from '../../../../shared/application/notification.service';

/**
 * New password with the code of the recovery link (/auth/reset-password?email=…&code=…). Resetting
 * the password also unlocks the account.
 * @author DataBit
 */
@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslatePipe, AuthLayout, ErrorMessagePipe],
  templateUrl: './reset-password.html',
  styleUrl: '../sign-in/sign-in.css'
})
export class ResetPassword {
  readonly email = input<string>('');
  readonly code = input<string>('');
  private readonly iamStore = inject(IamStore);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  protected readonly saving = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, AppValidators.email]],
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    newPassword: ['', [Validators.required, AppValidators.strongPassword]],
    confirmPassword: ['', [Validators.required, AppValidators.matches('newPassword')]]
  });

  constructor() {
    effect(() => this.form.patchValue({email: this.email() ?? '', code: this.code() ?? ''}));
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    try {
      const {email, code, newPassword} = this.form.getRawValue();
      await this.iamStore.resetPassword(email, code, newPassword);
      this.notifications.success('auth.reset.done-detail');
      await this.router.navigate(['/auth/sign-in']);
    } catch (error) {
      this.notifications.error(error, 'auth.reset.error');
    } finally {
      this.saving.set(false);
    }
  }
}
