import {computed, inject, Service, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {MlRecommendationsApi} from '../infrastructure/ml-recommendations-api';
import {DemandForecast} from '../domain/model/demand-forecast.entity';
import {Recommendation} from '../domain/model/recommendation.entity';
import {ApiError} from '../../shared/infrastructure/api-error';

/**
 * State of ML &amp; Recommendations: the latest demand forecast and the recommendations it produced.
 * @author DataBit
 */
@Service()
export class MlRecommendationsStore {
  private readonly mlApi = inject(MlRecommendationsApi);
  private readonly forecastSignal = signal<DemandForecast | null>(null);
  private readonly recommendationsSignal = signal<Recommendation[]>([]);
  private readonly loadingForecastSignal = signal<boolean>(false);
  private readonly generatingSignal = signal<boolean>(false);
  private readonly loadingRecommendationsSignal = signal<boolean>(false);

  readonly forecast = this.forecastSignal.asReadonly();
  readonly recommendations = this.recommendationsSignal.asReadonly();
  readonly loadingForecast = this.loadingForecastSignal.asReadonly();
  readonly generating = this.generatingSignal.asReadonly();
  readonly loadingRecommendations = this.loadingRecommendationsSignal.asReadonly();
  readonly pendingRecommendations = computed(() => this.recommendationsSignal().filter(recommendation => !recommendation.applied));

  /** Loads the latest forecast; 404 just means none was generated yet. */
  loadLatestForecast(): Promise<void> {
    this.loadingForecastSignal.set(true);
    return firstValueFrom(this.mlApi.getLatestForecast())
      .then(forecast => this.forecastSignal.set(forecast))
      .catch(error => {
        if (ApiError.from(error).status !== 404) throw error;
        this.forecastSignal.set(null);
      })
      .finally(() => this.loadingForecastSignal.set(false));
  }

  /** Asks the API for a new forecast (it also refreshes the recommendations). */
  async generateForecast(): Promise<DemandForecast> {
    this.generatingSignal.set(true);
    try {
      const forecast = await firstValueFrom(this.mlApi.generateForecast(7));
      this.forecastSignal.set(forecast);
      return forecast;
    } finally {
      this.generatingSignal.set(false);
    }
  }

  loadRecommendations(): Promise<void> {
    this.loadingRecommendationsSignal.set(true);
    return firstValueFrom(this.mlApi.getRecommendations())
      .then(recommendations => this.recommendationsSignal.set(recommendations))
      .finally(() => this.loadingRecommendationsSignal.set(false));
  }

  async applyRecommendation(recommendation: Recommendation): Promise<void> {
    const applied = await firstValueFrom(this.mlApi.applyRecommendation(recommendation.id));
    this.recommendationsSignal.update(list => list.map(candidate => (candidate.id === applied.id ? applied : candidate)));
  }
}
