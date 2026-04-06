import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { RegisterFormControls } from '../auth-form.types';
import { emailValidator } from '../../../shared/validators/email.validator';
import { passwordsMatchValidator } from '../../../shared/validators/passwords-match.validator';
import { passwordStrengthValidator } from '../../../shared/validators/password-strength.validator';
import { usernameLettersValidator } from '../../../shared/validators/username.validator';

/** Builds the register reactive form (validators and structure live here for tests/reuse). */
export function createRegisterForm(): FormGroup<RegisterFormControls> {
  return new FormGroup<RegisterFormControls>(
    {
      email: new FormControl('', { nonNullable: true, validators: emailValidator() }),
      firstName: new FormControl('', { nonNullable: true, validators: Validators.required }),
      lastName: new FormControl('', { nonNullable: true, validators: Validators.required }),
      username: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, usernameLettersValidator],
      }),
      tel: new FormControl('', { nonNullable: true }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, passwordStrengthValidator],
      }),
      repeatPassword: new FormControl('', { nonNullable: true, validators: Validators.required }),
    },
    { validators: passwordsMatchValidator },
  );
}
