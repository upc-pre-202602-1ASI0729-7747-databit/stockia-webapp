import {computed, inject, Service, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {StockManagementApi} from '../infrastructure/stock-management-api';
import {InventoryItem} from '../domain/model/inventory-item.entity';
import {StockAllocation} from '../domain/services/stock-allocation';

/**
 * State of Stock Management: the supply lots of the restaurant (newest first) and the indicators the
 * dashboard and the recipes read from them.
 * @author DataBit
 */
@Service()
export class StockManagementStore {
  private readonly stockApi = inject(StockManagementApi);
  private readonly itemsSignal = signal<InventoryItem[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly loadedSignal = signal<boolean>(false);
  private readonly errorSignal = signal<unknown>(null);

  readonly items = this.itemsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly itemsNeedingAttention = computed(() => this.itemsSignal().filter(item => item.needsAttention));
  readonly preferredLotIds = computed(() => StockAllocation.preferredLotIds(this.itemsSignal()));

  /** Number of lots of the same product as the given lot. */
  readonly lotsOfProduct = (item: InventoryItem) => computed(() =>
    this.itemsSignal().filter(candidate => candidate.productKey === item.productKey).length);

  loadItems(): Promise<void> {
    this.loadingSignal.set(true);
    return firstValueFrom(this.stockApi.getInventoryItems()).then(items => {
      this.itemsSignal.set([...items].sort((a, b) => b.id - a.id));
      this.loadedSignal.set(true);
      this.errorSignal.set(null);
    }).catch(error => {
      this.errorSignal.set(error);
    }).finally(() => this.loadingSignal.set(false));
  }

  /** Creates (id 0) or updates a lot; the API recalculates the expiration date from the shelf life. */
  async saveItem(item: InventoryItem): Promise<InventoryItem> {
    const saved = await firstValueFrom(item.id ? this.stockApi.updateInventoryItem(item) : this.stockApi.createInventoryItem(item));
    await this.loadItems();
    return saved;
  }

  async deleteItem(item: InventoryItem): Promise<void> {
    await firstValueFrom(this.stockApi.deleteInventoryItem(item.id));
    this.itemsSignal.update(items => items.filter(candidate => candidate.id !== item.id));
  }
}
