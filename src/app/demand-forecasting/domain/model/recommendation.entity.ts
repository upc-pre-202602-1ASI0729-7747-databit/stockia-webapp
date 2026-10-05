import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { RECOMMENDATION_TYPE_LABELS, RecommendationType } from './recommendation-type';

/** Automatic menu or purchase recommendation derived from the demand forecast. */
export class Recommendation implements BaseEntity {
  /** Unique identifier of the recommendation. */
  #id: number;
  /** Kind of recommendation. */
  #type: RecommendationType;
  /** Action the restaurant is advised to take. */
  #message: string;
  /** Expected effect of applying the recommendation. */
  #expectedImpact: string;
  /** Whether the restaurant already applied the recommendation. */
  #applied: boolean;

  /**
   * @param recommendation - Initial state of the recommendation.
   */
  constructor(recommendation: {
    id: number;
    type: RecommendationType;
    message: string;
    expectedImpact: string;
    applied: boolean;
  }) {
    this.#id = recommendation.id;
    this.#type = recommendation.type;
    this.#message = recommendation.message;
    this.#expectedImpact = recommendation.expectedImpact;
    this.#applied = recommendation.applied;
  }

  /** Unique identifier of the recommendation. */
  get id(): number {
    return this.#id;
  }

  set id(value: number) {
    this.#id = value;
  }

  /** Kind of recommendation. */
  get type(): RecommendationType {
    return this.#type;
  }

  set type(value: RecommendationType) {
    this.#type = value;
  }

  /** Action the restaurant is advised to take. */
  get message(): string {
    return this.#message;
  }

  set message(value: string) {
    this.#message = value;
  }

  /** Expected effect of applying the recommendation. */
  get expectedImpact(): string {
    return this.#expectedImpact;
  }

  set expectedImpact(value: string) {
    this.#expectedImpact = value;
  }

  /** Whether the restaurant already applied the recommendation. */
  get applied(): boolean {
    return this.#applied;
  }

  set applied(value: boolean) {
    this.#applied = value;
  }

  /**
   * Gives the text shown to the user for the recommendation type.
   *
   * @returns The type label, e.g. `"Sugerencia de compra"`.
   */
  typeLabel(): string {
    return RECOMMENDATION_TYPE_LABELS[this.#type];
  }

  /** Marks the recommendation as applied by the restaurant. */
  apply(): void {
    this.#applied = true;
  }
}
