import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {DecimalQuantity, MAX_QUANTITY_DECIMALS} from '../domain/model/decimal-quantity';

/** Same password rule as the API: 8 to 72 characters with letters and numbers. */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Form validators shared by the bounded contexts; each error maps to a "validation.*" key.
 * @author DataBit
 */
export class AppValidators {
  static strongPassword: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const text = String(control.value ?? '');
    if (!text) return null;
    return text.length >= PASSWORD_MIN_LENGTH && text.length <= 72 && /[A-Za-z]/.test(text) && /\d/.test(text)
      ? null : {passwordStrength: {min: PASSWORD_MIN_LENGTH}};
  };

  static email: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const text = String(control.value ?? '').trim();
    return !text || /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/.test(text) ? null : {email: true};
  };

  static optionalPhone: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const text = String(control.value ?? '').trim();
    return !text || /^\+?[\d\s-]{6,20}$/.test(text) ? null : {phone: true};
  };

  /** Exact quantity with up to 32 decimals; positive when the quantity must be greater than 0. */
  static quantity(positive = false): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const text = String(control.value ?? '').trim();
      if (!text) return null;
      if (!DecimalQuantity.isValidText(text)) return {decimal: {max: MAX_QUANTITY_DECIMALS}};
      return positive && DecimalQuantity.of(text).lte(0) ? {positive: true} : null;
    };
  }

  static matches(otherControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const other = control.parent?.get(otherControlName);
      return !other || control.value === other.value ? null : {passwordsMatch: true};
    };
  }

  /** Translation key and parameters of the first error of a control. */
  static messageOf(control: AbstractControl | null): {key: string; params?: Record<string, unknown>} | null {
    const errors = control?.errors;
    if (!errors) return null;
    if (errors['required']) return {key: 'validation.required'};
    if (errors['email']) return {key: 'validation.email'};
    if (errors['minlength']) return {key: 'validation.min-length', params: {min: errors['minlength'].requiredLength}};
    if (errors['min']) return {key: 'validation.min-value', params: {min: errors['min'].min}};
    if (errors['passwordStrength']) return {key: 'validation.password-strength', params: {min: PASSWORD_MIN_LENGTH}};
    if (errors['passwordsMatch']) return {key: 'validation.passwords-match'};
    if (errors['phone']) return {key: 'validation.phone'};
    if (errors['decimal']) return {key: 'validation.decimal', params: {max: MAX_QUANTITY_DECIMALS}};
    if (errors['positive']) return {key: 'validation.positive'};
    if (errors['server']) return {key: String(errors['server'])};
    return {key: 'validation.required'};
  }
}
