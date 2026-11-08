import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { AlertChannel, AlertSeverity, AlertType } from '../domain/model/alert.entity';

export interface AlertResource extends BaseResource {
  id: number;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  channel: AlertChannel;
  createdAt?: string;
  acknowledged?: boolean;
  deliveredChannels?: AlertChannel[];
  requiredChannels?: AlertChannel[];
  delivered?: boolean;
  inventoryItemId?: number | null;
}

export interface AlertsResponse extends BaseResponse {
  alerts: AlertResource[];
}
