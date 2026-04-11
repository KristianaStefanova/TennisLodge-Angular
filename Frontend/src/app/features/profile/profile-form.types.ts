import { FormControl } from '@angular/forms';

export interface ProfileFormControls {
  username: FormControl<string>;
  email: FormControl<string>;
  tel: FormControl<string>;
}
