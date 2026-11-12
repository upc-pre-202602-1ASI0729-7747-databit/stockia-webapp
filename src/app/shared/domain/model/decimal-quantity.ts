import Decimal from 'decimal.js';

/** Maximum decimals of a quantity (same rule as the API). */
export const MAX_QUANTITY_DECIMALS = 32;

Decimal.set({ precision: 80, rounding: Decimal.ROUND_HALF_UP });

const QUANTITY_PATTERN = new RegExp(`^\\d+([.,]\\d{1,${MAX_QUANTITY_DECIMALS}})?$`);

/**
 * Exact quantities of supplies. The API sends them as text with up to 32 decimals; they are never
 * converted to a JavaScript number, so 0.1 + 0.2 is exactly 0.3.
 * @author DataBit
 */
export class DecimalQuantity {
  static of(value: unknown): Decimal {
    if (value instanceof Decimal) return value;
    if (value === null || value === undefined || value === '') return new Decimal(0);
    try {
      return new Decimal(String(value).trim().replace(',', '.'));
    } catch {
      return new Decimal(0);
    }
  }

  /** Whether the text is a non-negative number with up to 32 decimals ("0.125" or "0,125"). */
  static isValidText(text: unknown): boolean {
    return QUANTITY_PATTERN.test(String(text ?? '').trim());
  }

  /** Exact text for the API (never in exponent notation). */
  static toText(value: unknown): string {
    return DecimalQuantity.of(value).toFixed();
  }

  /** Grouped digits in the language of the user, keeping every decimal. */
  static format(value: unknown, language = 'en'): string {
    const formatter = new Intl.NumberFormat(language === 'es' ? 'es-419' : 'en-US');
    const [integer, fraction] = DecimalQuantity.of(value).toFixed().split('.');
    const sign = integer.startsWith('-') ? '-' : '';
    const grouped = formatter.format(BigInt(integer.replace('-', '')));
    const separator = formatter.formatToParts(1.5).find((part) => part.type === 'decimal')?.value ?? '.';
    return fraction ? `${sign}${grouped}${separator}${fraction}` : `${sign}${grouped}`;
  }
}

