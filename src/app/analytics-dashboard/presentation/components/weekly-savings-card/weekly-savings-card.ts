import {Component, input} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {TranslatePipe} from '@ngx-translate/core';
import {WeeklySavings} from '../../../domain/model/weekly-savings.entity';
import {MoneyPipe} from '../../../../shared/presentation/pipes/money.pipe';
import {QuantityPipe} from '../../../../shared/presentation/pipes/quantity.pipe';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date.pipe';

/**
 * Weekly savings of the restaurant (Administrator): estimated savings, rescued stock, waste and sales.
 * @author DataBit
 */
@Component({
  selector: 'app-weekly-savings-card',
  imports: [MatCardModule, TranslatePipe, MoneyPipe, QuantityPipe, LocalDatePipe],
  templateUrl: './weekly-savings-card.html',
  styles: `.figures { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
    .figure { padding: 12px; border-radius: 10px; background: #f4f7f5; } .figure strong { display: block; font-size: 1.3rem; color: #14301f; }
    .main { background: #e8f5ee; } .lists { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin-top: 12px; }
    ul { padding-left: 18px; margin: 4px 0; } h3 { font-size: 0.95rem; margin: 0; }`
})
export class WeeklySavingsCard {
  readonly savings = input.required<WeeklySavings>();
}
