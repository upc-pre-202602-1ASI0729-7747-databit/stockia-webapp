import {inject, Pipe, PipeTransform} from '@angular/core';
import {LanguageStore} from '../../application/language.store';

/**
 * Date (or date and time) in the user's language. Dates without time ("2026-10-31") are shown as
 * they are, without a time zone shift. Usage: {{ sale.saleDate | localDate: true }}
 * @author DataBit
 */
@Pipe({name: 'localDate', pure: false})
export class LocalDatePipe implements PipeTransform {
  private readonly language = inject(LanguageStore);

  transform(value: Date | string | null | undefined, withTime = false): string {
    if (!value) return '';
    const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
    return new Intl.DateTimeFormat(this.language.locale(), withTime
      ? {dateStyle: 'medium', timeStyle: 'short'} : {dateStyle: 'medium'}).format(date);
  }
}
