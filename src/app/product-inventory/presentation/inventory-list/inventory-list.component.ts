import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InventoryService } from '../../application/inventory.service';
import {
  InventoryItem,
  StorageType,
  STORAGE_LABEL,
  STOCK_STATUS_LABEL,
  StockStatus,
} from '../../domain/inventory-item.entity';

@Component({
  selector: 'app-inventory-list',
  imports: [ReactiveFormsModule],
  templateUrl: './inventory-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './inventory-list.component.css',
})
export class InventoryListComponent implements OnInit {
  private fb = inject(FormBuilder);
  inventory = inject(InventoryService);

  showForm = signal(false);
  editingId = signal<number | null>(null);
  storageOptions = Object.values(StorageType);
  storageLabel = STORAGE_LABEL;
  statusLabel = STOCK_STATUS_LABEL;
  StockStatus = StockStatus;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    unit: ['kg', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0)]],
    minThreshold: [5, [Validators.required, Validators.min(0)]],
    storageType: [StorageType.AMBIENT, Validators.required],
    shelfLifeDays: [7, [Validators.required, Validators.min(1)]],
    unitCost: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.inventory.loadItems().subscribe();
  }

  statusClass(item: InventoryItem) {
    switch (item.status) {
      case StockStatus.CRITICAL:
      case StockStatus.EXPIRED:
        return 'badge badge-danger';
      case StockStatus.LOW:
        return 'badge badge-warning';
      default:
        return 'badge badge-success';
    }
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({
      name: '',
      unit: 'kg',
      quantity: 0,
      minThreshold: 5,
      storageType: StorageType.AMBIENT,
      shelfLifeDays: 7,
      unitCost: 0,
    });
    this.showForm.set(true);
  }

  openEdit(item: InventoryItem) {
    this.editingId.set(item.id);
    this.form.setValue({
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      minThreshold: item.minThreshold,
      storageType: item.storageType,
      shelfLifeDays: item.shelfLifeDays,
      unitCost: item.unitCost,
    });
    this.showForm.set(true);
  }

  cancel() {
    this.showForm.set(false);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const expirationDate = new Date(Date.now() + raw.shelfLifeDays * 86400000)
      .toISOString()
      .slice(0, 10);
    const payload = { ...raw, expirationDate };

    const id = this.editingId();
    const request = id
      ? this.inventory.updateItem(id, payload)
      : this.inventory.createItem(payload);
    request.subscribe(() => this.showForm.set(false));
  }

  remove(item: InventoryItem) {
    if (confirm(`¿Eliminar "${item.name}" del inventario?`)) {
      this.inventory.deleteItem(item.id).subscribe();
    }
  }
}
