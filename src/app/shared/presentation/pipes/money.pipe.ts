import {inject, Pipe, PipeTransform} from '@angular/core';
import {LanguageStore} from '../../application/language.store';

/**
 * Amount in soles with two decimals in the user's language: "S/ 1,234.50" or "S/ 1 234,50".
 * Usage: {{ amount | money }}
 * @author DataBit
 */
@Pipe({name: 'money', pure: false})
export class MoneyPipe implements PipeTransform {
  private readonly language = inject(LanguageStore);

  transform(amount: number | null | undefined): string {
    const formatter = new Intl.NumberFormat(this.language.locale(), {minimumFractionDigits: 2, maximumFractionDigits: 2});
    return `S/ ${formatter.format(Number(amount) || 0)}`;
  }
}
