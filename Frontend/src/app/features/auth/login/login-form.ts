import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { LoginFormControls } from '../auth-form.types';
import { emailValidator } from '../../../shared/validators/email.validator';

/** Builds the login reactive form (validators and structure live here for tests/reuse). */
export function createLoginForm(): FormGroup<LoginFormControls> {
  return new FormGroup<LoginFormControls>({
    email: new FormControl('', { nonNullable: true, validators: emailValidator() }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
}
