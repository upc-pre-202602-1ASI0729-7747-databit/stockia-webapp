import {inject, Service} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {LanguageStore} from './language.store';
import {ApiError} from '../infrastructure/api-error';

/**
 * Short messages for the user (Material snack bar). Error messages prefer the localized detail sent by
 * the API, so the business rule that failed is explained in the user's language.
 * @author DataBit
 */
@Service()
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly language = inject(LanguageStore);

  success(key: string, params?: Record<string, unknown>): void {
    this.snackBar.open(this.language.instant(key, params), '✕', {duration: 4000, panelClass: 'snackbar-success', politeness: 'polite'});
  }

  error(error: unknown, fallbackKey = 'errors.save'): void {
    this.snackBar.open(this.messageOf(error, fallbackKey), '✕', {duration: 6000, panelClass: 'snackbar-error', politeness: 'assertive'});
  }

  /** Text that explains an error: the API detail, or a translated fallback. */
  messageOf(error: unknown, fallbackKey = 'errors.save'): string {
    if (!error) return this.language.instant(fallbackKey);
    const apiError = ApiError.from(error);
    if (apiError.status === -1) return this.language.instant(fallbackKey);
    if (apiError.isNetworkError) return this.language.instant('errors.network');
    return apiError.detail || this.language.instant(fallbackKey);
  }
}
