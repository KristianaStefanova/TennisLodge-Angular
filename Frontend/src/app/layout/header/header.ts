import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { resolvePublicAssetUrl } from '../../core/utils/public-asset-url';
import type { User } from '../../shared/interfaces/user.interface';
import { NotificationService } from '../../core/services/notification.service';

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
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  private readonly headerAvatarBroken = signal(false);

  readonly accountMenuOpen = signal(false);
  private readonly accountDropdown = viewChild<ElementRef<HTMLElement>>('accountDropdown');

  readonly headerAvatarSrc = computed(() => {
    if (this.headerAvatarBroken()) {
      return null;
    }
    return resolvePublicAssetUrl(this.auth.user()?.profilePictureUrl);
  });

  readonly headerUserInitials = computed(() => initialsFromUser(this.auth.user()));
  readonly notification = this.notificationService.notification;

  constructor() {
    effect(() => {
      this.auth.user()?.profilePictureUrl;
      this.headerAvatarBroken.set(false);
    });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.notificationService.showSuccess('You have logged out successfully.');
        void this.router.navigateByUrl('/');
      },
      error: () => {
        this.notificationService.showError('Could not log out. Please try again.');
        void this.router.navigateByUrl('/');
      },
    });
  }

  toggleAccountMenu(event: Event): void {
    event.stopPropagation();
    this.accountMenuOpen.update((open) => !open);
  }

  closeAccountMenu(): void {
    this.accountMenuOpen.set(false);
  }

  logoutFromMenu(): void {
    this.closeAccountMenu();
    this.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.accountMenuOpen()) {
      return;
    }
    const root = this.accountDropdown()?.nativeElement;
    if (root?.contains(event.target as Node)) {
      return;
    }
    this.accountMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscapeCloseAccountMenu(): void {
    if (this.accountMenuOpen()) {
      this.accountMenuOpen.set(false);
    }
  }

  onHeaderAvatarError(): void {
    this.headerAvatarBroken.set(true);
  }
}
