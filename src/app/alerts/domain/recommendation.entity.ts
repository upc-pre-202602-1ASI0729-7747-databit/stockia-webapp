export enum RecommendationType {
  MENU_ADJUSTMENT = 'MENU_ADJUSTMENT',
  PURCHASE_SUGGESTION = 'PURCHASE_SUGGESTION',
}

export const RECOMMENDATION_TYPE_LABEL: Record<RecommendationType, string> = {
  [RecommendationType.MENU_ADJUSTMENT]: 'Ajuste de menú',
  [RecommendationType.PURCHASE_SUGGESTION]: 'Sugerencia de compra',
};

export class Recommendation {
  constructor(
    public id: number,
    public type: RecommendationType,
    public message: string,
    public expectedImpact: string,
    public applied: boolean,
  ) {}

  static fromJson(json: any): Recommendation {
    return new Recommendation(json.id, json.type, json.message, json.expectedImpact, json.applied);
  }
}
