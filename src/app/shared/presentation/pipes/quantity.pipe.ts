import {inject, Pipe, PipeTransform} from '@angular/core';
import {LanguageStore} from '../../application/language.store';
import {DecimalQuantity} from '../../domain/model/decimal-quantity';

/**
 * Exact quantity with every decimal and its unit: {{ item.quantity | quantity: item.unit }}
 * @author DataBit
 */
@Pipe({name: 'quantity', pure: false})
export class QuantityPipe implements PipeTransform {
  private readonly language = inject(LanguageStore);

  transform(value: unknown, unit = ''): string {
    const text = DecimalQuantity.format(value, this.language.language());
    return unit ? `${text} ${unit}` : text;
  }
}
