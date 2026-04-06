import { FormControl } from '@angular/forms';

/** Typed controls for `loginForm` / `registerForm` in auth feature components. */

/** Non-nullable controls for the login form group. */
export interface LoginFormControls {
  email: FormControl<string>;
  password: FormControl<string>;
}

/** Non-nullable controls for the register form group. */
export interface RegisterFormControls {
  email: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  username: FormControl<string>;
  tel: FormControl<string>;
  password: FormControl<string>;
  repeatPassword: FormControl<string>;
}
