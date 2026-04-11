import { Directive, HostBinding, Input, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appInputError]',
  standalone: true,
})
export class InputErrorDirective {
  private readonly ngControl = inject(NgControl, { optional: true });

  @Input({ alias: 'appInputErrorGroup' }) groupInvalid = false;

  @HostBinding('class.input-error')
  get hasError(): boolean {
    if (this.groupInvalid) {
      return true;
    }
    const c = this.ngControl?.control;
    if (!c) {
      return false;
    }
    return c.invalid && (c.touched || c.dirty);
  }
}
