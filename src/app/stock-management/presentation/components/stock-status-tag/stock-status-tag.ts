import {Component, computed, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {StockStatus} from '../../../domain/model/inventory-item.entity';

/**
 * Colored tag of the stock status of a lot (text plus color, never color alone).
 * @author DataBit
 */
@Component({
  selector: 'app-stock-status-tag',
  imports: [TranslatePipe],
  template: `<span class="tag" [class]="'tag ' + css()">{{ 'inventory.status.' + status() | translate }}</span>`
})
export class StockStatusTag {
  readonly status = input.required<StockStatus>();
  protected readonly css = computed(() => ({AVAILABLE: 'tag-success', LOW: 'tag-warning', CRITICAL: 'tag-danger', EXPIRED: 'tag-danger'})[this.status()]);
}
