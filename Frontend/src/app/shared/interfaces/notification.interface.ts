/** App toast payload (not the browser `Notification` API). */
export interface ToastNotification {
  message: string;
  type: 'success' | 'error' | 'info';
}