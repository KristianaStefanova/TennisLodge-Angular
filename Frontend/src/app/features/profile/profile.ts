import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  OnInit,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserService } from '../../core/services/user.service';
import { resolvePublicAssetUrl } from '../../core/utils/public-asset-url';
import { InputErrorDirective } from '../../shared/directives/input-error.directive';
import type { User } from '../../shared/interfaces/user';
import type { UserProfileUpdate } from '../../shared/interfaces/user.dto';
import { validationKeys } from '../../shared/validators/validation-keys';
import { createProfileForm } from './profile-form';
import type { ProfileFormControls } from './profile-form.types';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
const MAX_BYTES = 2 * 1024 * 1024;

const PROFILE_FIELD_FOCUS_ORDER: (keyof ProfileFormControls)[] = ['username', 'email', 'tel'];

@Component({
  selector: 'app-profile',
  imports: [RouterLink, ReactiveFormsModule, InputErrorDirective],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly userService = inject(UserService);
  private readonly pageTitle = inject(Title);
  private readonly injector = inject(Injector);

  private readonly pictureFileInput = viewChild<ElementRef<HTMLInputElement>>('pictureFileInput');
  private readonly profileHeading = viewChild<ElementRef<HTMLElement>>('profileHeading');
  private readonly profileSaveAlert = viewChild<ElementRef<HTMLElement>>('profileSaveAlert');

  readonly profileForm = createProfileForm();

  readonly validationKeys: typeof validationKeys = validationKeys;

  readonly refreshing = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly profileSaving = signal(false);
  readonly profileSaveError = signal<string | null>(null);
  readonly pictureUploading = signal(false);
  readonly pictureError = signal<string | null>(null);

  readonly detailsEditing = signal(false);

  readonly user = this.auth.user;

  readonly displayName = computed(() => {
    const u = this.user();
    if (!u) {
      return '';
    }
    const full = `${u.firstName} ${u.lastName}`.trim();
    return full || u.username;
  });

  readonly initials = computed(() => {
    const u = this.user();
    if (!u) {
      return '?';
    }
    const a = u.firstName?.trim().charAt(0) ?? '';
    const b = u.lastName?.trim().charAt(0) ?? '';
    const pair = `${a}${b}`.toUpperCase();
    if (pair.length > 0) {
      return pair;
    }
    return u.username.trim().charAt(0).toUpperCase() || '?';
  });

  readonly avatarBroken = signal(false);

  constructor() {
    effect(() => {
      const u = this.user();
      if (!u || this.detailsEditing()) {
        return;
      }
      if (!this.profileForm.dirty) {
        this.patchProfileFormFromUser(u);
      }
    });

    this.profileForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.profileSaveError.set(null));
  }

  ngOnInit(): void {
    this.pageTitle.setTitle('Profile — Tennis Lodge');
  }

  pictureSrc(url: string | undefined): string | null {
    return resolvePublicAssetUrl(url);
  }

  refreshProfile(): void {
    this.refreshing.set(true);
    this.auth
      .loadCurrentUser()
      .pipe(finalize(() => this.refreshing.set(false)))
      .subscribe({
        next: (u) => {
          if (u) {
            this.loadError.set(null);
            this.avatarBroken.set(false);
            this.detailsEditing.set(false);
            this.patchProfileFormFromUser(u);
            this.profileForm.markAsPristine();
            this.profileForm.markAsUntouched();
          } else {
            this.loadError.set(
              'We could not load your profile. Check your connection or sign in again.',
            );
          }
        },
      });
  }

  saveProfile(): void {
    this.profileSaveError.set(null);
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.scrollToFirstInvalidField();
      return;
    }

    const raw = this.profileForm.getRawValue();
    const updates: UserProfileUpdate = {
      username: raw.username.trim(),
      email: raw.email.trim().toLowerCase(),
      tel: raw.tel.trim(),
    };

    this.profileSaving.set(true);

    this.auth
      .updateProfile(updates)
      .pipe(finalize(() => this.profileSaving.set(false)))
      .subscribe({
        next: () => {
          this.profileSaveError.set(null);
          this.profileForm.markAsPristine();
          this.profileForm.markAsUntouched();
          this.detailsEditing.set(false);
          this.notificationService.showSuccess('Profile updated successfully.');
        },
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Could not save your profile.';
          this.profileSaveError.set(msg);
          this.notificationService.showError(msg);
          this.scrollProfileSaveErrorIntoView();
        },
      });
  }

  startEditingDetails(): void {
    const u = this.user();
    if (!u) {
      return;
    }
    this.profileSaveError.set(null);
    this.patchProfileFormFromUser(u);
    this.profileForm.markAsPristine();
    this.profileForm.markAsUntouched();
    this.detailsEditing.set(true);
    afterNextRender(
      () => {
        document.getElementById('profile-input-username')?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }

  cancelEditingDetails(): void {
    const u = this.user();
    if (u) {
      this.patchProfileFormFromUser(u);
    }
    this.profileForm.markAsPristine();
    this.profileForm.markAsUntouched();
    this.profileSaveError.set(null);
    this.detailsEditing.set(false);
  }

  private patchProfileFormFromUser(u: User): void {
    this.profileForm.patchValue(
      {
        username: u.username,
        email: u.email,
        tel: u.tel ?? '',
      },
      { emitEvent: false },
    );
  }

  private scrollToFirstInvalidField(): void {
    afterNextRender(
      () => {
        for (const key of PROFILE_FIELD_FOCUS_ORDER) {
          if (this.profileForm.controls[key].invalid) {
            const el = document.getElementById(`profile-input-${String(key)}`);
            el?.focus({ preventScroll: true });
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }
        }
      },
      { injector: this.injector },
    );
  }

  private scrollProfileSaveErrorIntoView(): void {
    afterNextRender(
      () => {
        const el = this.profileSaveAlert()?.nativeElement;
        const title = this.profileHeading()?.nativeElement;
        (title ?? el)?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        el?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }

  onAvatarError(): void {
    this.avatarBroken.set(true);
  }

  openPicturePicker(): void {
    this.pictureError.set(null);
    this.pictureFileInput()?.nativeElement.click();
  }

  onPictureFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      this.pictureError.set('Please choose a JPEG, PNG, GIF, or WebP image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      this.pictureError.set('Image must be 2 MB or smaller.');
      return;
    }

    this.pictureUploading.set(true);
    this.pictureError.set(null);

    this.userService
      .uploadProfilePicture(file)
      .pipe(finalize(() => this.pictureUploading.set(false)))
      .subscribe({
        next: (u) => {
          this.auth.setSessionUser(u);
          this.avatarBroken.set(false);
          this.notificationService.showSuccess('Profile picture updated successfully.');
        },
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Could not update your photo.';
          this.pictureError.set(msg);
          this.notificationService.showError(msg);
        },
      });
  }
}
