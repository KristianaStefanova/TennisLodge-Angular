import {
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { resolvePublicAssetUrl } from '../../../core/utils/public-asset-url';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
const MAX_BYTES = 2 * 1024 * 1024;

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly title = inject(Title);

  private readonly pictureFileInput = viewChild<ElementRef<HTMLInputElement>>('pictureFileInput');

  readonly refreshing = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly editNoticeVisible = signal(false);
  readonly pictureUploading = signal(false);
  readonly pictureError = signal<string | null>(null);

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

  ngOnInit(): void {
    this.title.setTitle('Profile — Tennis Lodge');
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
          } else {
            this.loadError.set(
              'We could not load your profile. Check your connection or sign in again.',
            );
          }
        },
      });
  }

  onAvatarError(): void {
    this.avatarBroken.set(true);
  }

  onEditProfileClick(): void {
    this.editNoticeVisible.set(true);
  }

  dismissEditNotice(): void {
    this.editNoticeVisible.set(false);
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
        },
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Could not update your photo.';
          this.pictureError.set(msg);
        },
      });
  }
}
