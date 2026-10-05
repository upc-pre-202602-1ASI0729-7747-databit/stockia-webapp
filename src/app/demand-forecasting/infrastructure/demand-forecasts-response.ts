import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/** API representation of the projected demand of a dish for a single day. */
export interface ForecastDataPointResource {
  /** Projected day, in `YYYY-MM-DD` format. */
  date: string;
  /** Short name of the projected week day, e.g. `"Lun"`. */
  dayLabel: string;
  /** Dish the projection refers to. */
  dishName: string;
  /** Units of the dish expected to be sold that day. */
  projectedUnits: number;
}

/** API representation of a demand forecast. */
export interface DemandForecastResource extends BaseResource {
  /** Moment the forecast was generated, as an ISO 8601 timestamp. */
  generatedAt: string;
  /** Confidence of the model in the projection, between 0 and 1. */
  confidenceScore: number;
  /** Weather condition considered by the model. */
  weatherCondition: string;
  /** Projected demand, one data point per day. */
  dataPoints: ForecastDataPointResource[];
}

/** Envelope returned by APIs that wrap the list of demand forecasts. */
export interface DemandForecastsResponse extends BaseResponse {
  /** Demand forecasts contained in the response. */
  demandForecasts: DemandForecastResource[];
}
