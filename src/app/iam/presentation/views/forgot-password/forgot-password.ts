import {Component, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';
import {PasswordResetRequest} from '../../../domain/model/password-reset-request';
import {AuthLayout} from '../../../../shared/presentation/components/auth-layout/auth-layout';
import {ErrorMessagePipe} from '../../../../shared/presentation/pipes/error-message.pipe';
import {AppValidators} from '../../../../shared/presentation/validators';
import {NotificationService} from '../../../../shared/application/notification.service';

/**
 * "Forgot your password?" (Password Reset Service): emails a recovery link. While the email provider
 * is simulated, the API returns a copy of the email so the demo can open the link.
 * @author DataBit
 */
@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, TranslatePipe, AuthLayout,
    ErrorMessagePipe],
  templateUrl: './forgot-password.html',
  styleUrl: '../sign-in/sign-in.css'
})
export class ForgotPassword {
  private readonly iamStore = inject(IamStore);
  private readonly notifications = inject(NotificationService);
  protected readonly sending = signal(false);
  protected readonly request = signal<PasswordResetRequest | null>(null);
  protected readonly form = inject(FormBuilder).nonNullable.group({email: ['', [Validators.required, AppValidators.email]]});

  /** Path and query of the simulated recovery link, to open it inside the application. */
  protected linkQuery(link: string): Record<string, string> {
    const url = new URL(link);
    return {email: url.searchParams.get('email') ?? '', code: url.searchParams.get('code') ?? ''};
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.sending()) return;
    this.sending.set(true);
    try {
      this.request.set(await this.iamStore.requestPasswordReset(this.form.getRawValue().email));
    } catch (error) {
      this.notifications.error(error, 'auth.forgot.error');
    } finally {
      this.sending.set(false);
    }
  }
}
