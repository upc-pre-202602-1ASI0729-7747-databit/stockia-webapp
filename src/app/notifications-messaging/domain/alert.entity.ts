import { BaseEntity } from '../../shared/domain/model/base-entity';

export type AlertType = 'LOW_STOCK' | 'CRITICAL_STOCK' | 'EXPIRING_SOON' | 'IOT_FAULT';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertChannel = 'WHATSAPP' | 'EMAIL';
export const ALERT_TYPES: AlertType[] = [
  'LOW_STOCK',
  'CRITICAL_STOCK',
  'EXPIRING_SOON',
  'IOT_FAULT',
];
export const ALERT_SEVERITIES: AlertSeverity[] = ['INFO', 'WARNING', 'CRITICAL'];
export const ALERT_CHANNELS: AlertChannel[] = ['WHATSAPP', 'EMAIL'];

/**
 * An alert of the restaurant. It is delivered only after a successful attempt on every required
 * channel (critical alerts need WhatsApp and email) and can be attended only once delivered.
 * @author DataBit
 */
export class Alert implements BaseEntity {
  #id: number;
  #type: AlertType;
  #severity: AlertSeverity;
  #message: string;
  #channel: AlertChannel;
  #createdAt: Date;
  #acknowledged: boolean;
  #deliveredChannels: AlertChannel[];
  #requiredChannels: AlertChannel[];
  #delivered: boolean;
  #inventoryItemId: number | null;

  constructor(alert: {
    id?: number;
    type?: AlertType;
    severity?: AlertSeverity;
    message?: string;
    channel?: AlertChannel;
    createdAt?: Date;
    acknowledged?: boolean;
    deliveredChannels?: AlertChannel[];
    requiredChannels?: AlertChannel[];
    delivered?: boolean;
    inventoryItemId?: number | null;
  }) {
    this.#id = alert.id ?? 0;
    this.#type = alert.type ?? 'LOW_STOCK';
    this.#severity = alert.severity ?? 'WARNING';
    this.#message = alert.message ?? '';
    this.#channel = alert.channel ?? 'WHATSAPP';
    this.#createdAt = alert.createdAt ?? new Date();
    this.#acknowledged = alert.acknowledged ?? false;
    this.#deliveredChannels = alert.deliveredChannels ?? [];
    this.#requiredChannels = alert.requiredChannels ?? [this.#channel];
    this.#delivered = alert.delivered ?? false;
    this.#inventoryItemId = alert.inventoryItemId ?? null;
  }

  get id(): number {
    return this.#id;
  }
  set id(value: number) {
    this.#id = value;
  }
  get type(): AlertType {
    return this.#type;
  }
  set type(value: AlertType) {
    this.#type = value;
  }
  get severity(): AlertSeverity {
    return this.#severity;
  }
  set severity(value: AlertSeverity) {
    this.#severity = value;
  }
  get message(): string {
    return this.#message;
  }
  set message(value: string) {
    this.#message = value;
  }
  get channel(): AlertChannel {
    return this.#channel;
  }
  set channel(value: AlertChannel) {
    this.#channel = value;
  }
  get createdAt(): Date {
    return this.#createdAt;
  }
  get acknowledged(): boolean {
    return this.#acknowledged;
  }
  get deliveredChannels(): AlertChannel[] {
    return this.#deliveredChannels;
  }
  get requiredChannels(): AlertChannel[] {
    return this.#requiredChannels;
  }
  get delivered(): boolean {
    return this.#delivered;
  }
  get isAutomatic(): boolean {
    return this.#inventoryItemId !== null;
  }

  /** First required channel still without a successful delivery. */
  get pendingChannel(): AlertChannel | null {
    return (
      this.#requiredChannels.find((channel) => !this.#deliveredChannels.includes(channel)) ?? null
    );
  }

  get isPending(): boolean {
    return !this.#acknowledged;
  }
}
