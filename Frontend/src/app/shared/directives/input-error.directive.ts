import { Directive, HostBinding, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Toggles `input-error` on the host (use on the same element as `formControlName`).
 * Same idea as your original: {@link NgControl} + class binding.
 */
@Directive({
  selector: '[appInputError]',
  standalone: true,
})
export class InputErrorDirective {
  private readonly ngControl = inject(NgControl, { optional: true });

  @HostBinding('class.input-error')
  get hasError(): boolean {
    const c = this.ngControl?.control;
    if (!c) {
      return false;
    }
    return c.invalid && (c.touched || c.dirty);
  }
}
