import { FormControl } from '@angular/forms';

export interface LoginFormControls {
  email: FormControl<string>;
  password: FormControl<string>;
}

export interface RegisterFormControls {
  email: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  username: FormControl<string>;
  tel: FormControl<string>;
  password: FormControl<string>;
  repeatPassword: FormControl<string>;
}
