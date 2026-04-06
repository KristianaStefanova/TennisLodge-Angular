import { Directive, forwardRef } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { emailValidator } from '../validators/email.validator';

@Directive({
  selector: '[appEmailValidator]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EmailValidatorDirective),
      multi: true,
    },
  ],
})
export class EmailValidatorDirective implements Validator {
  private readonly validateFn = emailValidator();

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validateFn(control);
  }
}
