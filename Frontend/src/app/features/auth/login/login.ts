import { afterNextRender, Component, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import type { LoginCredentials } from '../../../shared/interfaces/user.dto';

export type LoginField = 'email' | 'password';

function isValidEmail(value: string): boolean {
  const s = value.trim().toLowerCase();
  return s.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
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
  private readonly emailField = viewChild<ElementRef<HTMLInputElement>>('emailField');
  private readonly passwordField = viewChild<ElementRef<HTMLInputElement>>('passwordField');

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly invalidFields = signal<ReadonlySet<LoginField>>(new Set());

  email = '';
  password = '';

  isFieldInvalid(name: LoginField): boolean {
    return this.invalidFields().has(name);
  }

  onFieldChange(field: LoginField): void {
    const keys = this.invalidFields();
    if (!keys.has(field)) {
      return;
    }
    const next = new Set(keys);
    next.delete(field);
    this.invalidFields.set(next);
    if (next.size === 0) {
      this.error.set(null);
    }
  }

  submit(): void {
    this.error.set(null);
    this.invalidFields.set(new Set());

    const email = this.email.trim().toLowerCase();
    const password = this.password;

    const missing: LoginField[] = [];
    if (!email) {
      missing.push('email');
    }
    if (!password) {
      missing.push('password');
    }

    if (missing.length > 0) {
      this.showValidationIssue('Please enter your email and password.', missing);
      return;
    }

    if (!isValidEmail(email)) {
      this.showValidationIssue(
        'Please enter a valid email address (e.g. name@example.com — include @ and a domain with a dot).',
        ['email'],
      );
      return;
    }

    this.submitting.set(true);

    const credentials: LoginCredentials = { email, password };

    this.auth
      .login(credentials)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: async () => {
          this.invalidFields.set(new Set());
          await this.router.navigateByUrl(this.postLoginTarget());
        },
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Could not sign in.';
          this.invalidFields.set(new Set());
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

  private showValidationIssue(message: string, fields: LoginField[]): void {
    this.error.set(message);
    this.invalidFields.set(new Set(fields));
    this.scrollAlertIntoView(fields[0]);
  }

  private scrollAlertIntoView(focusField?: LoginField): void {
    afterNextRender(
      () => {
        const el = this.alertBanner()?.nativeElement;
        const title = this.loginTitle()?.nativeElement;
        (title ?? el)?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        if (focusField) {
          this.inputForField(focusField)?.focus({ preventScroll: true });
        } else {
          el?.focus({ preventScroll: true });
        }
      },
      { injector: this.injector },
    );
  }

  private inputForField(field: LoginField): HTMLInputElement | undefined {
    switch (field) {
      case 'email':
        return this.emailField()?.nativeElement;
      case 'password':
        return this.passwordField()?.nativeElement;
    }
  }
}
