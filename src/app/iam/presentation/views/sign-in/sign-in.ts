import {Component, inject, input, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';
import {SignInCommand} from '../../../domain/model/sign-in.command';
import {AuthLayout} from '../../../../shared/presentation/components/auth-layout/auth-layout';
import {ErrorMessagePipe} from '../../../../shared/presentation/pipes/error-message.pipe';
import {AppValidators} from '../../../../shared/presentation/validators';
import {ApiError} from '../../../../shared/infrastructure/api-error';
import {NotificationService} from '../../../../shared/application/notification.service';
import {LanguageStore} from '../../../../shared/application/language.store';

/**
 * Sign-in (Login Controller). Shows the attempts left before the account is locked, or until when it
 * is locked, as the API reports them.
 * @author DataBit
 */
@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    TranslatePipe, AuthLayout, ErrorMessagePipe],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css'
})
export class SignIn {
  /** Path to return to after signing in (query parameter set by the guard). */
  readonly redirect = input<string>();
  private readonly iamStore = inject(IamStore);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly language = inject(LanguageStore);
  protected readonly sessionExpired = this.iamStore.sessionExpired;
  protected readonly submitting = signal(false);
  protected readonly hidePassword = signal(true);
  protected readonly problem = signal<string | null>(null);
  protected readonly hint = signal<string | null>(null);
  protected readonly demoAccounts = ['admin@databitecorp.com', 'empleado@databitecorp.com'];
  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, AppValidators.email]],
    password: ['', Validators.required]
  });

  protected useDemo(email: string): void {
    this.form.setValue({email, password: 'stockia123'});
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    this.problem.set(null);
    this.hint.set(null);
    try {
      const {email, password} = this.form.getRawValue();
      await this.iamStore.signIn(new SignInCommand(email.trim(), password));
      const target = this.redirect()?.startsWith('/app') ? this.redirect()! : '/app/dashboard';
      await this.router.navigateByUrl(target);
    } catch (error) {
      const apiError = ApiError.from(error);
      this.problem.set(this.notifications.messageOf(apiError, 'iam.errors.invalid-credentials'));
      const details = apiError.details as {remainingAttempts?: number; maxAttempts?: number; lockedUntil?: string} | null;
      if (details?.remainingAttempts !== undefined)
        this.hint.set(this.language.instant('auth.sign-in.attempts-left', {remaining: details.remainingAttempts, max: details.maxAttempts}));
      else if (details?.lockedUntil)
        this.hint.set(this.language.instant('auth.sign-in.locked-until',
          {time: new Intl.DateTimeFormat(this.language.locale(), {timeStyle: 'short'}).format(new Date(details.lockedUntil))}));
    } finally {
      this.submitting.set(false);
    }
  }
}
