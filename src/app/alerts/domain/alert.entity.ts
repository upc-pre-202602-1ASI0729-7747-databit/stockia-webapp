export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  EXPIRING_SOON = 'EXPIRING_SOON',
  IOT_FAULT = 'IOT_FAULT',
  CRITICAL_STOCK = 'CRITICAL_STOCK',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export const ALERT_TYPE_LABEL: Record<AlertType, string> = {
  [AlertType.LOW_STOCK]: 'Stock bajo',
  [AlertType.EXPIRING_SOON]: 'Por vencer',
  [AlertType.IOT_FAULT]: 'Falla de equipo (IoT)',
  [AlertType.CRITICAL_STOCK]: 'Stock crítico',
};

export type AlertChannel = 'WHATSAPP' | 'EMAIL';

export class Alert {
  constructor(
    public id: number,
    public type: AlertType,
    public severity: AlertSeverity,
    public message: string,
    public createdAt: string,
    public acknowledged: boolean,
    public channel: AlertChannel = 'WHATSAPP',
    public deliveredChannels: AlertChannel[] = [],
  ) {}

  get requiredChannels(): AlertChannel[] {
    return this.severity === AlertSeverity.CRITICAL ? ['WHATSAPP', 'EMAIL'] : [this.channel];
  }

  get pendingChannel(): AlertChannel | null {
    return this.requiredChannels.find((c) => !this.deliveredChannels.includes(c)) ?? null;
  }

  get delivered(): boolean {
    return this.pendingChannel === null;
  }

  static fromJson(json: any): Alert {
    const channel: AlertChannel = json.channel ?? 'WHATSAPP';
    return new Alert(
      json.id,
      json.type,
      json.severity,
      json.message,
      json.createdAt,
      json.acknowledged,
      channel,
      json.deliveredChannels ?? [channel],
    );
  }
}
