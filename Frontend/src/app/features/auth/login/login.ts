import { afterNextRender, Component, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import type { LoginCredentials } from '../../../shared/interfaces/user.dto';
import { validationKeys } from '../../../shared/validators/validation-keys';
import { createLoginForm } from './login-form';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);

  private readonly loginTitle = viewChild<ElementRef<HTMLElement>>('loginTitle');
  private readonly alertBanner = viewChild<ElementRef<HTMLElement>>('loginAlert');

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly loginForm = createLoginForm();

  /** Usado en la plantilla: `hasError(validationKeys.invalidEmail)`, etc. */
  readonly validationKeys: typeof validationKeys = validationKeys;

  constructor() {
    this.loginForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.error.set(null));
  }

  submit(): void {
    this.error.set(null);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.scrollToFirstIssue();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    const credentials: LoginCredentials = { email: email.trim().toLowerCase(), password };

    this.submitting.set(true);

    this.auth
      .login(credentials)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: async () => {
          await this.router.navigateByUrl(this.postLoginTarget());
        },
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Could not sign in.';
          this.error.set(msg);
          this.scrollAlertIntoView();
        },
      });
  }

  private postLoginTarget(): string {
    const raw = this.route.snapshot.queryParamMap.get('returnUrl');
    if (raw && raw.startsWith('/') && !raw.startsWith('//')) {
      return raw;
    }
    return '/';
  }

  private scrollToFirstIssue(): void {
    const order = ['email', 'password'] as const;
    afterNextRender(
      () => {
        for (const key of order) {
          if (this.loginForm.controls[key].invalid) {
            const el = document.getElementById(`login-input-${key}`);
            el?.focus({ preventScroll: true });
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }
        }
      },
      { injector: this.injector },
    );
  }

  private scrollAlertIntoView(): void {
    afterNextRender(
      () => {
        const el = this.alertBanner()?.nativeElement;
        const title = this.loginTitle()?.nativeElement;
        (title ?? el)?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        el?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }
}
