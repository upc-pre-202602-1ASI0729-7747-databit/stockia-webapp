import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { DemandForecast } from '../domain/model/demand-forecast.entity';
import { Recommendation } from '../domain/model/recommendation.entity';
import { DemandForecastingService } from '../infrastructure/demand-forecasting.service';

/** Dishes projected when there is no previous forecast to take them from. */
const DEFAULT_DISH_NAMES = [
  'Pizza Margarita',
  'Lomo Saltado',
  'Ensalada César',
  'Pollo a la Brasa',
];

/**
 * Copies a recommendation so it can be changed without touching the stored one.
 *
 * @param recommendation - Recommendation to copy.
 * @returns A new recommendation with the same state.
 */
function copyRecommendation(recommendation: Recommendation): Recommendation {
  return new Recommendation({
    id: recommendation.id,
    type: recommendation.type,
    message: recommendation.message,
    expectedImpact: recommendation.expectedImpact,
    applied: recommendation.applied,
  });
}

/** Application state and use cases of the ML and Recommendations context. */
@Injectable({ providedIn: 'root' })
export class DemandForecastingStore {
  /** API facade of the bounded context. */
  private readonly demandForecastingService = inject(DemandForecastingService);

  /** Demand forecasts generated so far. */
  private readonly forecastsSignal = signal<DemandForecast[]>([]);
  /** Automatic recommendations. */
  private readonly recommendationsSignal = signal<Recommendation[]>([]);
  /** Number of load requests in flight. */
  private readonly pendingLoadsSignal = signal(0);
  /** Whether a new forecast is being generated. */
  private readonly generatingSignal = signal(false);
  /** Identifier of the recommendation being applied, or `null` when idle. */
  private readonly applyingIdSignal = signal<number | null>(null);
  /** Message of the last failed use case. */
  private readonly errorSignal = signal<string | null>(null);

  /** Demand forecasts generated so far. */
  readonly forecasts = this.forecastsSignal.asReadonly();
  /** Automatic recommendations. */
  readonly recommendations = this.recommendationsSignal.asReadonly();
  /** Whether a new forecast is being generated. */
  readonly generating = this.generatingSignal.asReadonly();
  /** Identifier of the recommendation being applied, or `null` when idle. */
  readonly applyingId = this.applyingIdSignal.asReadonly();
  /** Message of the last failed use case, or `null` when it succeeded. */
  readonly error = this.errorSignal.asReadonly();
  /** Whether forecasts or recommendations are being loaded. */
  readonly loading = computed(() => this.pendingLoadsSignal() > 0);

  /** Most recently generated forecast, or `null` when there is none. */
  readonly latestForecast = computed(() =>
    this.forecastsSignal().reduce<DemandForecast | null>(
      (latest, forecast) =>
        latest === null || forecast.generatedAt > latest.generatedAt ? forecast : latest,
      null,
    ),
  );

  /** Recommendations the restaurant has not applied yet. */
  readonly pendingRecommendations = computed(() =>
    this.recommendationsSignal().filter((recommendation) => !recommendation.applied),
  );

  /** Loads every demand forecast generated so far. */
  async loadForecasts(): Promise<void> {
    const forecasts = await this.load(
      this.demandForecastingService.getDemandForecasts(),
      'No se pudieron cargar las predicciones',
    );
    if (forecasts) {
      this.forecastsSignal.set(forecasts);
    }
  }

  /** Loads every automatic recommendation. */
  async loadRecommendations(): Promise<void> {
    const recommendations = await this.load(
      this.demandForecastingService.getRecommendations(),
      'No se pudieron cargar las recomendaciones',
    );
    if (recommendations) {
      this.recommendationsSignal.set(recommendations);
    }
  }

  /**
   * Generates and saves a new 7-day demand forecast.
   * Projects the dishes of the latest forecast, or a default menu when there is none.
   *
   * @returns `true` when the forecast was saved.
   */
  async generateForecast(): Promise<boolean> {
    const latestDishes = this.latestForecast()?.dataPoints.map((point) => point.dishName) ?? [];
    const dishNames = latestDishes.length > 0 ? [...new Set(latestDishes)] : DEFAULT_DISH_NAMES;
    const forecast = DemandForecast.simulate({ dishNames });

    this.generatingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const saved = await firstValueFrom(
        this.demandForecastingService.createDemandForecast(forecast),
      );
      this.forecastsSignal.update((forecasts) => [...forecasts, saved]);
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'No se pudo generar la predicción'));
      return false;
    } finally {
      this.generatingSignal.set(false);
    }
  }

  /**
   * Marks a recommendation as applied.
   *
   * @param id - Identifier of the recommendation to apply.
   * @returns `true` when the change was saved.
   */
  async applyRecommendation(id: number): Promise<boolean> {
    const current = this.recommendationsSignal().find((recommendation) => recommendation.id === id);
    if (!current) {
      this.errorSignal.set('La recomendación ya no está disponible.');
      return false;
    }
    if (current.applied) {
      return true;
    }
    const recommendation = copyRecommendation(current);
    recommendation.apply();

    this.applyingIdSignal.set(id);
    this.errorSignal.set(null);
    try {
      const saved = await firstValueFrom(
        this.demandForecastingService.updateRecommendation(recommendation),
      );
      this.recommendationsSignal.update((recommendations) =>
        recommendations.map((candidate) => (candidate.id === id ? saved : candidate)),
      );
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'No se pudo aplicar la recomendación'));
      return false;
    } finally {
      this.applyingIdSignal.set(null);
    }
  }

  /**
   * Runs a load request while tracking the loading and error state.
   *
   * @param request - Request to run.
   * @param failureMessage - Message shown when the request fails.
   * @returns The loaded value, or `null` when the request failed.
   */
  private async load<T>(request: Observable<T>, failureMessage: string): Promise<T | null> {
    this.pendingLoadsSignal.update((pending) => pending + 1);
    this.errorSignal.set(null);
    try {
      return await firstValueFrom(request);
    } catch (error) {
      this.errorSignal.set(this.formatError(error, failureMessage));
      return null;
    } finally {
      this.pendingLoadsSignal.update((pending) => pending - 1);
    }
  }

  /**
   * Builds the message shown to the user when a use case fails.
   *
   * @param error - Error raised by the request.
   * @param fallback - Description of what could not be done.
   * @returns The fallback, followed by the error detail when there is one.
   */
  private formatError(error: unknown, fallback: string): string {
    return error instanceof Error && error.message
      ? `${fallback} (${error.message}).`
      : `${fallback}.`;
  }
}
