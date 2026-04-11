import { afterNextRender, Component, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import type { RegisterPayload } from '../../../shared/interfaces/user.dto';
import { InputErrorDirective } from '../../../shared/directives/input-error.directive';
import { passwordStrengthReason, validationKeys } from '../../../shared/validators/validation-keys';
import { createRegisterForm } from './register-form';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, InputErrorDirective],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  private readonly registerTitle = viewChild<ElementRef<HTMLElement>>('registerTitle');
  private readonly alertBanner = viewChild<ElementRef<HTMLElement>>('registerAlert');

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly registerForm = createRegisterForm();

  readonly validationKeys = validationKeys;
  readonly passwordStrengthReason = passwordStrengthReason;

  constructor() {
    this.registerForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.error.set(null));
  }

  passwordGroupInvalid(): boolean {
    return (
      this.registerForm.hasError(validationKeys.passwordsMismatch) &&
      this.registerForm.dirty &&
      !!this.registerForm.controls.password.value &&
      !!this.registerForm.controls.repeatPassword.value
    );
  }

  submit(): void {
    this.error.set(null);
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.scrollToFirstIssue();
      return;
    }

    const v = this.registerForm.getRawValue();
    const registrationPayload: RegisterPayload = {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      email: v.email.trim().toLowerCase(),
      username: v.username.trim(),
      password: v.password,
      repeatPassword: v.repeatPassword,
      ...(v.tel.trim() ? { tel: v.tel.trim() } : {}),
    };

    this.submitting.set(true);

    this.auth
      .register(registrationPayload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: async () => {
          await this.router.navigateByUrl('/');
        },
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Could not create account.';
          this.error.set(msg);
          this.scrollAlertIntoView();
        },
      });
  }

  private scrollToFirstIssue(): void {
    const fieldOrder = ['email', 'firstName', 'lastName', 'username', 'password', 'repeatPassword'] as const;
    afterNextRender(
      () => {
        for (const key of fieldOrder) {
          if (this.registerForm.controls[key].invalid) {
            const el = document.getElementById(`register-input-${key}`);
            el?.focus({ preventScroll: true });
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }
        }
        if (this.registerForm.hasError(validationKeys.passwordsMismatch)) {
          const el = document.getElementById('register-input-repeatPassword');
          el?.focus({ preventScroll: true });
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      { injector: this.injector },
    );
  }

  private scrollAlertIntoView(): void {
    afterNextRender(
      () => {
        const el = this.alertBanner()?.nativeElement;
        const title = this.registerTitle()?.nativeElement;
        (title ?? el)?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        el?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }
}
