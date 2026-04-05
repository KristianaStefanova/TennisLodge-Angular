import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { resolvePublicAssetUrl } from '../../core/utils/public-asset-url';
import type { User } from '../../shared/interfaces/user';

function initialsFromUser(u: User | null | undefined): string {
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
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly headerAvatarBroken = signal(false);

  readonly headerAvatarSrc = computed(() => {
    if (this.headerAvatarBroken()) {
      return null;
    }
    return resolvePublicAssetUrl(this.auth.user()?.profilePictureUrl);
  });

  readonly headerUserInitials = computed(() => initialsFromUser(this.auth.user()));

  constructor() {
    effect(() => {
      this.auth.user()?.profilePictureUrl;
      this.headerAvatarBroken.set(false);
    });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => void this.router.navigateByUrl('/'),
      error: () => void this.router.navigateByUrl('/'),
    });
  }

  onHeaderAvatarError(): void {
    this.headerAvatarBroken.set(true);
  }
}
