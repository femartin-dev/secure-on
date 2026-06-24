import { Injectable } from '@angular/core';

type ToastType = 'error' | 'success' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastTimeout: any;
  private readonly iconByType: Record<ToastType, string> = {
    error: 'dangerous',
    success: 'check_circle',
    warning: 'warning',
    info: 'info'
  };

  constructor() {}

  /**
   * Show toast notification as an on-screen element
   */
  private async showToast(type: ToastType, message: string, duration: number = 2000): Promise<void> {
    try {
      // Remove existing toast if any
      const existing = document.getElementById('app-toast');
      if (existing) existing.remove();
      if (this.toastTimeout) clearTimeout(this.toastTimeout);

      // Create toast element
      const toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = `app-toast toast-${type}`;
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');

      const icon = document.createElement('span');
      icon.className = 'material-symbols-outlined';
      icon.textContent = this.iconByType[type];

      const text = document.createElement('span');
      text.className = 'app-toast__text';
      text.textContent = message;

      toast.appendChild(icon);
      toast.appendChild(text);

      document.body.appendChild(toast);
      // Trigger fade-in
      requestAnimationFrame(() => {
        toast.classList.add('is-visible');
      });

      // Auto-remove after duration
      this.toastTimeout = setTimeout(() => {
        toast.classList.remove('is-visible');
        setTimeout(() => toast.remove(), 300);
      }, duration);

      console.log(`[TOAST ${type} ${duration}ms]: ${message}`);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Show error notification
   */
  async showError(message: string): Promise<void> {
    await this.showToast('error', `${message}`, 3000);
  }

  /**
   * Show success notification
   */
  async showSuccess(message: string): Promise<void> {
    await this.showToast('success', `${message}`, 2000);
  }

  /**
   * Show warning notification
   */
  async showWarning(message: string): Promise<void> {
    await this.showToast('warning', `${message}`, 2500);
  }

  /**
   * Show info notification
   */
  async showInfo(message: string): Promise<void> {
    await this.showToast('info', `${message}`, 2000);
  }
}
