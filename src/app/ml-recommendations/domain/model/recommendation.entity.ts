import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type RecommendationType = 'PURCHASE_SUGGESTION' | 'MENU_ADJUSTMENT';

/**
 * Automatic suggestion to buy supplies or adjust the menu, generated from the demand forecast. Its
 * texts arrive already translated to the language of the user.
 * @author DataBit
 */
export class Recommendation implements BaseEntity {
  #id: number;
  #type: RecommendationType;
  #message: string;
  #expectedImpact: string;
  #applied: boolean;
  #createdAt: Date;

  constructor(recommendation: {id?: number; type?: RecommendationType; message?: string; expectedImpact?: string; applied?: boolean;
    createdAt?: Date}) {
    this.#id = recommendation.id ?? 0;
    this.#type = recommendation.type ?? 'PURCHASE_SUGGESTION';
    this.#message = recommendation.message ?? '';
    this.#expectedImpact = recommendation.expectedImpact ?? '';
    this.#applied = recommendation.applied ?? false;
    this.#createdAt = recommendation.createdAt ?? new Date();
  }

  get id(): number { return this.#id; }
  get type(): RecommendationType { return this.#type; }
  get message(): string { return this.#message; }
  get expectedImpact(): string { return this.#expectedImpact; }
  get applied(): boolean { return this.#applied; }
  get createdAt(): Date { return this.#createdAt; }
}
