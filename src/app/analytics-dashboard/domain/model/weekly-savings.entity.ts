/** A supply in the savings detail: what was used before it expired, or what expired. */
export interface SavingsLine {
  itemName: string;
  unit: string;
  quantity: string;
  value: number;
}

/**
 * Weekly Savings Calculator (C4): stock rescued in its last days, waste of the week and the
 * comparison with the previous week. All amounts in soles.
 * @author DataBit
 */
export class WeeklySavings {
  constructor(
    readonly from: string,
    readonly to: string,
    readonly estimatedSavings: number,
    readonly rescuedValue: number,
    readonly wasteValue: number,
    readonly previousWasteValue: number,
    readonly wasteReduction: number,
    readonly confirmedSales: number,
    readonly portionsSold: number,
    readonly revenue: number,
    readonly previousRevenue: number,
    readonly topRescued: SavingsLine[],
    readonly wasted: SavingsLine[]
  ) {}

  /** How much more waste than last week (0 when it went down). */
  get wasteIncrease(): number {
    return Math.max(0, -this.wasteReduction);
  }

  /** "down" when there was less waste than last week, "up" when more, "same" otherwise. */
  get wasteTrend(): 'down' | 'up' | 'same' {
    if (this.wasteReduction > 0) return 'down';
    if (this.wasteReduction < 0) return 'up';
    return 'same';
  }
}
