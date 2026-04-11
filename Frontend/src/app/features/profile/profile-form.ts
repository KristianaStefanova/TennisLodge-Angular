import { FormControl, FormGroup, Validators } from '@angular/forms';
import { emailValidator } from '../../shared/validators/email.validator';
import { usernameLettersValidator } from '../../shared/validators/username.validator';
import type { ProfileFormControls } from './profile-form.types';

export function createProfileForm(): FormGroup<ProfileFormControls> {
  return new FormGroup<ProfileFormControls>({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, usernameLettersValidator],
    }),
    email: new FormControl('', { nonNullable: true, validators: emailValidator() }),
    tel: new FormControl('', { nonNullable: true }),
  });
}
