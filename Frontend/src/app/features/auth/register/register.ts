import { afterNextRender, Component, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import type { RegisterPayload } from '../../../shared/interfaces/user.dto';

export type RegisterField =
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'username'
  | 'password'
  | 'repeatPassword';

function passwordHasLetterAndNumber(p: string): boolean {
  return /[a-zA-Z]/.test(p) && /[0-9]/.test(p);
}

function isValidUsernameLettersOnly(u: string): boolean {
  return /^[a-zA-Z]{3,}$/.test(u);
}

function isValidEmail(value: string): boolean {
  const s = value.trim().toLowerCase();
  return s.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  private readonly registerTitle = viewChild<ElementRef<HTMLElement>>('registerTitle');
  private readonly alertBanner = viewChild<ElementRef<HTMLElement>>('registerAlert');
  private readonly emailField = viewChild<ElementRef<HTMLInputElement>>('emailField');
  private readonly firstNameField = viewChild<ElementRef<HTMLInputElement>>('firstNameField');
  private readonly lastNameField = viewChild<ElementRef<HTMLInputElement>>('lastNameField');
  private readonly usernameField = viewChild<ElementRef<HTMLInputElement>>('usernameField');
  private readonly passwordField = viewChild<ElementRef<HTMLInputElement>>('passwordField');
  private readonly repeatPasswordField = viewChild<ElementRef<HTMLInputElement>>('repeatPasswordField');

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly invalidFields = signal<ReadonlySet<RegisterField>>(new Set());

  email = '';
  firstName = '';
  lastName = '';
  username = '';
  password = '';
  repeatPassword = '';
  tel = '';

  isFieldInvalid(name: RegisterField): boolean {
    return this.invalidFields().has(name);
  }

  onFieldChange(field: RegisterField): void {
    const keys = this.invalidFields();
    const mismatchPair = keys.has('password') && keys.has('repeatPassword');

    if (mismatchPair && (field === 'password' || field === 'repeatPassword')) {
      const next = new Set(keys);
      next.delete('password');
      next.delete('repeatPassword');
      this.invalidFields.set(next);
      if (next.size === 0) {
        this.error.set(null);
      }
      return;
    }

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
    const firstName = this.firstName.trim();
    const lastName = this.lastName.trim();
    const username = this.username.trim();
    const password = this.password;
    const repeatPassword = this.repeatPassword;
    const tel = this.tel.trim();

    const missing: RegisterField[] = [];
    if (!email) {
      missing.push('email');
    }
    if (!firstName) {
      missing.push('firstName');
    }
    if (!lastName) {
      missing.push('lastName');
    }
    if (!username) {
      missing.push('username');
    }
    if (!password) {
      missing.push('password');
    }

    if (missing.length > 0) {
      this.showValidationIssue('Please complete all required fields.', missing);
      return;
    }

    if (!isValidEmail(email)) {
      this.showValidationIssue(
        'Please enter a valid email address (e.g. name@example.com — include @ and a domain with a dot).',
        ['email'],
      );
      return;
    }

    if (!isValidUsernameLettersOnly(username)) {
      this.showValidationIssue(
        'Username must be at least 3 letters (A–Z only, no numbers or spaces).',
        ['username'],
      );
      return;
    }

    if (password.length < 5) {
      this.showValidationIssue('Password must be at least 5 characters.', ['password']);
      return;
    }

    if (!passwordHasLetterAndNumber(password)) {
      this.showValidationIssue(
        'Password must include at least one letter and one number.',
        ['password', 'repeatPassword'],
      );
      return;
    }

    if (password !== repeatPassword) {
      this.showValidationIssue('Passwords do not match. Check both fields.', ['password', 'repeatPassword']);
      return;
    }

    this.submitting.set(true);

    const registrationPayload: RegisterPayload = {
      firstName,
      lastName,
      email,
      username,
      password,
      repeatPassword,
      ...(tel ? { tel } : {}),
    };

    this.auth.register(registrationPayload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: async () => {
          this.invalidFields.set(new Set());
          await this.router.navigateByUrl('/');
        },
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Could not create account.';
          this.invalidFields.set(new Set());
          this.error.set(msg);
          this.scrollAlertIntoView();
        },
      });
  }

  private showValidationIssue(message: string, fields: RegisterField[]): void {
    this.error.set(message);
    this.invalidFields.set(new Set(fields));
    this.scrollAlertIntoView(fields[0]);
  }

  private scrollAlertIntoView(focusField?: RegisterField): void {
    afterNextRender(
      () => {
        const el = this.alertBanner()?.nativeElement;
        const title = this.registerTitle()?.nativeElement;
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

  private inputForField(field: RegisterField): HTMLInputElement | undefined {
    switch (field) {
      case 'email':
        return this.emailField()?.nativeElement;
      case 'firstName':
        return this.firstNameField()?.nativeElement;
      case 'lastName':
        return this.lastNameField()?.nativeElement;
      case 'username':
        return this.usernameField()?.nativeElement;
      case 'password':
        return this.passwordField()?.nativeElement;
      case 'repeatPassword':
        return this.repeatPasswordField()?.nativeElement;
    }
  }
}
