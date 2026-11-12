import {inject, Pipe, PipeTransform} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {AppValidators} from '../validators';

/**
 * Translated message of the first validation error of a form control: <mat-error>{{ form.get('email') | errorMessage }}</mat-error>
 * @author DataBit
 */
@Pipe({name: 'errorMessage', pure: false})
export class ErrorMessagePipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(control: AbstractControl | null): string {
    const message = AppValidators.messageOf(control);
    return message ? this.translate.instant(message.key, message.params) : '';
  }
}
