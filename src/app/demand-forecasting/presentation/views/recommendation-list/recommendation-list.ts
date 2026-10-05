import { Component, OnInit, inject } from '@angular/core';
import { DemandForecastingStore } from '../../../application/demand-forecasting.store';
import { RecommendationCard } from '../../components/recommendation-card/recommendation-card';

/** "Recomendaciones" page: automatic menu and purchase recommendations. */
@Component({
  imports: [RecommendationCard],
  selector: 'app-recommendation-list',
  styleUrl: './recommendation-list.css',
  templateUrl: './recommendation-list.html',
})
export class RecommendationList implements OnInit {
  /** Application state of the bounded context. */
  protected readonly store = inject(DemandForecastingStore);

  /** Loads the recommendations. */
  ngOnInit(): void {
    void this.store.loadRecommendations();
  }

  /**
   * Applies a recommendation.
   *
   * @param id - Identifier of the recommendation to apply.
   */
  protected onApply(id: number): void {
    void this.store.applyRecommendation(id);
  }
}
