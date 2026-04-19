import { computed, Injectable, signal } from '@angular/core';
import { ToastNotification } from '../../shared/interfaces/notification.interface';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSignal = signal<ToastNotification | null>(null);
  private timeOutId: ReturnType<typeof setTimeout> | null = null;

  readonly notification = computed<ToastNotification | null>(() => this.notificationSignal());
  
  private showNotification(notification: ToastNotification): void {
    if (this.timeOutId) {
      clearTimeout(this.timeOutId);
    }

    this.notificationSignal.set(notification);

    this.timeOutId = setTimeout(() => {
      this.notificationSignal.set(null);
      this.timeOutId = null;
    }, 5000);
  }

  showSuccess(message: string): void {
    this.showNotification({ message, type: 'success' });
  }

  showError(message: string): void {
    this.showNotification({ message, type: 'error' });
  }

  /** Non-destructive updates (e.g. inbox hints). */
  showInfo(message: string): void {
    this.showNotification({ message, type: 'info' });
  }
}
