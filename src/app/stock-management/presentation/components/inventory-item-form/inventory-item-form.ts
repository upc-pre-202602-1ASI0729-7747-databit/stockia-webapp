import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {InventoryItem, STORAGE_TYPES, StorageType} from '../../../domain/model/inventory-item.entity';
import {StockManagementStore} from '../../../application/stock-management.store';
import {NotificationService} from '../../../../shared/application/notification.service';
import {ErrorMessagePipe} from '../../../../shared/presentation/pipes/error-message.pipe';
import {AppValidators} from '../../../../shared/presentation/validators';
import {MAX_QUANTITY_DECIMALS} from '../../../../shared/domain/model/decimal-quantity';

/**
 * Dialog to create or edit a supply lot. Quantities are typed as exact text (up to 32 decimals).
 * @author DataBit
 */
@Component({
  selector: 'app-inventory-item-form',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, TranslatePipe,
    ErrorMessagePipe],
  templateUrl: './inventory-item-form.html'
})
export class InventoryItemForm {
  protected readonly item = inject<InventoryItem | null>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<InventoryItemForm>);
  private readonly store = inject(StockManagementStore);
  private readonly notifications = inject(NotificationService);
  protected readonly storageTypes = STORAGE_TYPES;
  protected readonly maxDecimals = MAX_QUANTITY_DECIMALS;
  protected readonly saving = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: [this.item?.name ?? '', Validators.required],
    unit: [this.item?.unit ?? 'kg', Validators.required],
    storageType: [this.item?.storageType ?? ('AMBIENT' as StorageType), Validators.required],
    quantity: [this.item?.quantity ?? '', [Validators.required, AppValidators.quantity()]],
    minThreshold: [this.item?.minThreshold ?? '', [Validators.required, AppValidators.quantity()]],
    shelfLifeDays: [this.item?.shelfLifeDays ?? 7, [Validators.required, Validators.min(1)]],
    unitCost: [this.item?.unitCost ?? 0, [Validators.required, Validators.min(0)]]
  });

  protected async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const value = this.form.getRawValue();
    try {
      const saved = await this.store.saveItem(new InventoryItem({...value, id: this.item?.id ?? 0, quantity: value.quantity.trim(),
        minThreshold: value.minThreshold.trim(), shelfLifeDays: Number(value.shelfLifeDays), unitCost: Number(value.unitCost)}));
      this.notifications.success(this.item ? 'inventory.updated' : 'inventory.created', {name: saved.name});
      this.dialogRef.close(saved);
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.saving.set(false);
    }
  }
}
