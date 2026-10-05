/** Kinds of automatic recommendations the platform can suggest. */
export type RecommendationType = 'MENU_ADJUSTMENT' | 'PURCHASE_SUGGESTION';

/** Text shown to the user for each recommendation type. */
export const RECOMMENDATION_TYPE_LABELS: Record<RecommendationType, string> = {
  MENU_ADJUSTMENT: 'Ajuste de menú',
  PURCHASE_SUGGESTION: 'Sugerencia de compra',
};
