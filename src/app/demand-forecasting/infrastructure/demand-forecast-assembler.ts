import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { DemandForecast } from '../domain/model/demand-forecast.entity';
import { ForecastDataPoint } from '../domain/model/forecast-data-point';
import { DemandForecastResource, DemandForecastsResponse } from './demand-forecasts-response';

/** Converts between demand forecast entities and their API representations. */
export class DemandForecastAssembler implements BaseAssembler<
  DemandForecast,
  DemandForecastResource,
  DemandForecastsResponse
> {
  /**
   * Builds a demand forecast entity from an API resource.
   *
   * @param resource - Demand forecast as returned by the API.
   * @returns The matching domain entity.
   */
  toEntityFromResource(resource: DemandForecastResource): DemandForecast {
    return new DemandForecast({
      id: resource.id,
      generatedAt: resource.generatedAt,
      confidenceScore: resource.confidenceScore ?? 0,
      weatherCondition: resource.weatherCondition ?? '',
      dataPoints: (resource.dataPoints ?? []).map(
        (point) =>
          new ForecastDataPoint({
            date: point.date,
            dayLabel: point.dayLabel,
            dishName: point.dishName,
            projectedUnits: point.projectedUnits,
          }),
      ),
    });
  }

  /**
   * Builds the API resource of a demand forecast entity.
   *
   * @param entity - Demand forecast to send to the API.
   * @returns The matching API resource.
   */
  toResourceFromEntity(entity: DemandForecast): DemandForecastResource {
    return {
      id: entity.id,
      generatedAt: entity.generatedAt,
      confidenceScore: entity.confidenceScore,
      weatherCondition: entity.weatherCondition,
      dataPoints: entity.dataPoints.map((point) => ({
        date: point.date,
        dayLabel: point.dayLabel,
        dishName: point.dishName,
        projectedUnits: point.projectedUnits,
      })),
    };
  }

  /**
   * Builds demand forecast entities from an enveloped API response.
   *
   * @param response - Envelope containing the demand forecasts.
   * @returns The demand forecasts as domain entities.
   */
  toEntitiesFromResponse(response: DemandForecastsResponse): DemandForecast[] {
    return (response.demandForecasts ?? []).map((resource) => this.toEntityFromResource(resource));
  }
}
