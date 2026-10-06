// Enums del Bounded Context Inventory & Recipe Management (ver Capítulo IV, 4.6.5)
export enum StorageType {
  AMBIENT = 'AMBIENT',
  REFRIGERATED = 'REFRIGERATED',
  FROZEN = 'FROZEN',
}

export enum StockStatus {
  AVAILABLE = 'AVAILABLE',
  LOW = 'LOW',
  CRITICAL = 'CRITICAL',
  EXPIRED = 'EXPIRED',
}

export const STORAGE_LABEL: Record<StorageType, string> = {
  [StorageType.AMBIENT]: 'Ambiente',
  [StorageType.REFRIGERATED]: 'Refrigerado',
  [StorageType.FROZEN]: 'Congelado',
};

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  [StockStatus.AVAILABLE]: 'Disponible',
  [StockStatus.LOW]: 'Stock bajo',
  [StockStatus.CRITICAL]: 'Crítico',
  [StockStatus.EXPIRED]: 'Vencido',
};

// Aggregate Root InventoryItem (US19, US22)
export class InventoryItem {
  constructor(
    public id: number,
    public name: string,
    public unit: string,
    public quantity: number,
    public minThreshold: number,
    public storageType: StorageType,
    public shelfLifeDays: number,
    public expirationDate: string,
    public unitCost: number,
  ) {}

  get status(): StockStatus {
    const today = new Date();
    const expiry = new Date(this.expirationDate);
    const daysToExpire = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
    if (daysToExpire < 0) return StockStatus.EXPIRED;
    if (this.quantity <= 0) return StockStatus.CRITICAL;
    if (this.quantity <= this.minThreshold) return StockStatus.LOW;
    return StockStatus.AVAILABLE;
  }

  static fromJson(json: any): InventoryItem {
    return new InventoryItem(
      json.id, json.name, json.unit, json.quantity, json.minThreshold,
      json.storageType, json.shelfLifeDays, json.expirationDate, json.unitCost,
    );
  }
}
