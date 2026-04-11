import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { validationKeys } from './validation-keys';

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

export function optionalEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value?.trim()) {
      return null;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value.trim())) {
      return { [validationKeys.invalidEmail]: true };
    }

    return null;
  };
}
