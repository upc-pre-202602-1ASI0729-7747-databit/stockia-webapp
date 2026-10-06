// Bounded Context Sales / Order Management (ver Capítulo IV, 4.6.5 del informe).
// Aggregate Root: Sale. Entity: SaleLineItem. Value Objects conceptuales: Money,
// DishReference, SaleDate (representados aquí como campos primitivos de SaleLineItem/Sale,
// igual que en product-inventory, para mantener consistencia de estilo en el proyecto).
// Domain Events: DishSold, SaleRegistered, SaleVoided — ver comentario en
// application/sales.service.ts sobre cómo se simulan en el cliente.

// Canal por el que se originó la venta.
export enum SaleChannel {
  POS = 'POS',
  MANUAL = 'MANUAL',
}

// Estado del ciclo de vida de una venta. Una Sale confirmada es inmutable en
// sus líneas: solo puede anularse (SaleVoided), nunca editarse.
export enum SaleStatus {
  CONFIRMED = 'CONFIRMED',
  VOIDED = 'VOIDED',
}

export const SALE_CHANNEL_LABEL: Record<SaleChannel, string> = {
  [SaleChannel.POS]: 'Punto de venta',
  [SaleChannel.MANUAL]: 'Registro manual',
};

export const SALE_STATUS_LABEL: Record<SaleStatus, string> = {
  [SaleStatus.CONFIRMED]: 'Confirmada',
  [SaleStatus.VOIDED]: 'Anulada',
};

// Entity SaleLineItem: una línea vendida dentro de una Sale. unitPrice × quantity
// conforman el Value Object Money de cada línea (debe ser > 0, ver invariante en
// SaleRegistrationService).
export interface SaleLineItem {
  recipeId: number;
  dishName: string;
  unitPrice: number;
  quantity: number;
}

// Aggregate Root Sale del Bounded Context Sales / Order Management.
export class Sale {
  constructor(
    public id: number,
    public saleDate: string,
    public channel: SaleChannel,
    public status: SaleStatus,
    public lineItems: SaleLineItem[],
  ) {}

  // Total monetario de la venta: suma de unitPrice*quantity de todas las líneas.
  get total(): number {
    return this.lineItems.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  }

  static fromJson(json: any): Sale {
    return new Sale(
      json.id,
      json.saleDate,
      json.channel ?? SaleChannel.POS,
      json.status ?? SaleStatus.CONFIRMED,
      json.lineItems ?? [],
    );
  }
}
