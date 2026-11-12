import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {SaleBlocked} from '../../../domain/model/sale-blocked';
import {QuantityPipe} from '../../../../shared/presentation/pipes/quantity.pipe';

/**
 * Explains why a dish could not be sold (422 CannotSell): each missing, short or expired supply.
 * @author DataBit
 */
@Component({
  selector: 'app-sale-blocked-dialog',
  imports: [RouterLink, MatDialogModule, MatButtonModule, MatIconModule, TranslatePipe, QuantityPipe],
  template: `
    <h2 mat-dialog-title><mat-icon class="icon" aria-hidden="true">block</mat-icon> {{ 'recipes.blocked.title' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'recipes.blocked.lead' | translate: {dish: data.dish} }}</p>
      <ul>
        @for (shortage of data.shortages; track shortage.itemName) {
          <li><strong>{{ shortage.itemName }}</strong>: {{ 'recipes.shortage.' + shortage.reason | translate }}
            <span class="muted">{{ 'recipes.shortage.numbers' | translate: {required: (shortage.required | quantity: shortage.unit),
              available: (shortage.available | quantity: shortage.unit)} }}</span></li>
        }
      </ul>
      <p class="muted">{{ 'recipes.blocked.note' | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <a mat-button routerLink="/app/inventory" mat-dialog-close>{{ 'recipes.blocked.go-inventory' | translate }}</a>
      <button mat-flat-button type="button" mat-dialog-close cdkFocusInitial>{{ 'recipes.blocked.ok' | translate }}</button>
    </mat-dialog-actions>`,
  styles: `.icon { color: #b03224; vertical-align: middle; } li { margin-bottom: 8px; } li .muted { display: block; font-size: 0.85rem; }`
})
export class SaleBlockedDialog {
  protected readonly data = inject<SaleBlocked>(MAT_DIALOG_DATA);
}
