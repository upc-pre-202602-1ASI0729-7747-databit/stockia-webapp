import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Alert } from '../domain/model/alert.entity';
import { AlertResource, AlertsResponse } from './alerts-response';

/**
 * Translates alerts between the API resources and the domain.
 * @author DataBit
 */
export class AlertAssembler implements BaseAssembler<Alert, AlertResource, AlertsResponse> {
  toEntityFromResource(resource: AlertResource): Alert {
    return new Alert({
      id: resource.id,
      type: resource.type,
      severity: resource.severity,
      message: resource.message,
      channel: resource.channel,
      createdAt: resource.createdAt ? new Date(resource.createdAt) : new Date(),
      acknowledged: resource.acknowledged,
      deliveredChannels: resource.deliveredChannels,
      requiredChannels: resource.requiredChannels,
      delivered: resource.delivered,
      inventoryItemId: resource.inventoryItemId ?? null,
    });
  }

  /** Body of POST/PUT /alerts. */
  toResourceFromEntity(entity: Alert): AlertResource {
    return {
      id: entity.id,
      type: entity.type,
      severity: entity.severity,
      message: entity.message.trim(),
      channel: entity.channel,
    };
  }

  toEntitiesFromResponse(response: AlertsResponse): Alert[] {
    return response.alerts.map((resource) => this.toEntityFromResource(resource));
  }
}
