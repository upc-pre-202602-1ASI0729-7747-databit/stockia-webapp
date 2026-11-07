import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {ForecastDay, ForecastMethod, WeatherCondition} from '../domain/model/demand-forecast.entity';
import {RecommendationType} from '../domain/model/recommendation.entity';

export interface DemandForecastResource extends BaseResource {
  id: number;
  generatedAt: string;
  confidenceScore: number;
  weatherCondition: WeatherCondition;
  weatherSource: string;
  method: ForecastMethod;
  modelVersion: string;
  dataPoints: ForecastDay[];
}

export interface DemandForecastsResponse extends BaseResponse {
  demandForecasts: DemandForecastResource[];
}

export interface RecommendationResource extends BaseResource {
  id: number;
  type: RecommendationType;
  message: string;
  expectedImpact: string;
  applied: boolean;
  createdAt: string;
}

export interface RecommendationsResponse extends BaseResponse {
  recommendations: RecommendationResource[];
}
