import { AbstractControl, ValidationErrors } from '@angular/forms';
import { validationKeys } from './validation-keys';

/** At least 3 letters A–Z only. Empty defers to `required`. */
export function usernameLettersValidator(control: AbstractControl): ValidationErrors | null {
  const raw = control.value;
  if (raw == null || String(raw).trim() === '') {
    return null;
  }
  const u = String(raw).trim();
  if (!/^[a-zA-Z]{3,}$/.test(u)) {
    return { [validationKeys.usernameLetters]: true };
  }
  return null;
}
