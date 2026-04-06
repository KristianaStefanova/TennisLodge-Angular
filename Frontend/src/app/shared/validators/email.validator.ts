import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { validationKeys } from './validation-keys';

/**
 * Factory: required + basic email shape.
 * Empty → `required` (Angular built-in key); bad format → {@link validationKeys.invalidEmail}.
 */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return { required: true };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      return { [validationKeys.invalidEmail]: true };
    }

    return null;
  };
}
