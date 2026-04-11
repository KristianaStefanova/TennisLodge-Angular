import { AbstractControl, ValidationErrors } from '@angular/forms';
import { passwordStrengthReason, validationKeys } from './validation-keys';

export type { PasswordStrengthReason } from './validation-keys';

export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const v = control.value;
  if (v == null || v === '') {
    return null;
  }
  const s = String(v);
  if (s.length < 5) {
    return {
      [validationKeys.passwordStrength]: { reason: passwordStrengthReason.minLength },
    };
  }
  if (!/[a-zA-Z]/.test(s) || !/[0-9]/.test(s)) {
    return {
      [validationKeys.passwordStrength]: { reason: passwordStrengthReason.letterAndNumber },
    };
  }
  return null;
}
