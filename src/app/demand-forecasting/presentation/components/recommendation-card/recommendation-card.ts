import { Component, input, output } from '@angular/core';
import { Recommendation } from '../../../domain/model/recommendation.entity';

/** Card presenting an automatic recommendation and the action to apply it. */
@Component({
  selector: 'app-recommendation-card',
  styleUrl: './recommendation-card.css',
  templateUrl: './recommendation-card.html',
})
export class RecommendationCard {
  /** Recommendation presented by the card. */
  readonly recommendation = input.required<Recommendation>();
  /** Whether this recommendation is being applied. */
  readonly applying = input(false);
  /** Whether the apply action is disabled. */
  readonly disabled = input(false);

  /** Emits when the user asks to apply the recommendation. */
  readonly apply = output<void>();
}
