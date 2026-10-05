/** Short Spanish names of the week days, starting on Sunday. */
const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** Projected demand of a dish for a single day. Immutable value object. */
export class ForecastDataPoint {
  /** Projected day, in `YYYY-MM-DD` format. */
  readonly #date: string;
  /** Short name of the projected week day, e.g. `"Lun"`. */
  readonly #dayLabel: string;
  /** Dish the projection refers to. */
  readonly #dishName: string;
  /** Units of the dish expected to be sold that day. */
  readonly #projectedUnits: number;

  /**
   * @param dataPoint - State of the data point.
   */
  constructor(dataPoint: {
    date: string;
    dayLabel: string;
    dishName: string;
    projectedUnits: number;
  }) {
    this.#date = dataPoint.date;
    this.#dayLabel = dataPoint.dayLabel;
    this.#dishName = dataPoint.dishName;
    this.#projectedUnits = Math.max(0, Math.round(dataPoint.projectedUnits));
  }

  /** Projected day, in `YYYY-MM-DD` format. */
  get date(): string {
    return this.#date;
  }

  /** Short name of the projected week day, e.g. `"Lun"`. */
  get dayLabel(): string {
    return this.#dayLabel;
  }

  /** Dish the projection refers to. */
  get dishName(): string {
    return this.#dishName;
  }

  /** Units of the dish expected to be sold that day. */
  get projectedUnits(): number {
    return this.#projectedUnits;
  }

  /**
   * Builds the short week day name of a date.
   *
   * @param date - Date whose week day is needed.
   * @returns The short Spanish name, e.g. `"Lun"`.
   */
  static dayLabelOf(date: Date): string {
    return DAY_LABELS[date.getDay()];
  }
}
