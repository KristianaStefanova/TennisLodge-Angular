import { AbstractControl, ValidationErrors } from '@angular/forms';
import { validationKeys } from './validation-keys';

/**
 * FormGroup validator: compares `password` and `repeatPassword`.
 */
export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const repeatPassword = control.get('repeatPassword');

  if (!password || !repeatPassword) {
    return null;
  }

  if (password.value !== repeatPassword.value) {
    return { [validationKeys.passwordsMismatch]: true };
  }

  return null;
}
