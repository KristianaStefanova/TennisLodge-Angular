import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  readonly currentYear = new Date().getFullYear();
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  navigateTo(event: Event, targetUrl: string, requiresAuth = false): void {
    event.preventDefault();

    if (requiresAuth && !this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: targetUrl } });
      return;
    }

    void this.router.navigateByUrl(targetUrl);
  }

  backToTop(event: Event): void {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
