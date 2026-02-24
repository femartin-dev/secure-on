import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastTimeout: any;

  constructor() {}

  /**
   * Show toast notification as an on-screen element
   */
  async showToast(message: string, duration: number = 2000): Promise<void> {
    try {
      // Remove existing toast if any
      const existing = document.getElementById('app-toast');
      if (existing) existing.remove();
      if (this.toastTimeout) clearTimeout(this.toastTimeout);

      // Create toast element
      const toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.textContent = message;
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(28, 31, 38, 0.95)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontFamily: 'Public Sans, sans-serif',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        zIndex: '99999',
        maxWidth: '90vw',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'opacity 0.3s ease',
        opacity: '0'
      });

      document.body.appendChild(toast);
      // Trigger fade-in
      requestAnimationFrame(() => { toast.style.opacity = '1'; });

      // Auto-remove after duration
      this.toastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, duration);

      console.log(`[TOAST ${duration}ms]: ${message}`);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Show error notification
   */
  async showError(message: string): Promise<void> {
    await this.showToast(`❌ ${message}`, 3000);
  }

  /**
   * Show success notification
   */
  async showSuccess(message: string): Promise<void> {
    await this.showToast(`✓ ${message}`, 2000);
  }

  /**
   * Show warning notification
   */
  async showWarning(message: string): Promise<void> {
    await this.showToast(`⚠️ ${message}`, 2500);
  }

  /**
   * Show info notification
   */
  async showInfo(message: string): Promise<void> {
    await this.showToast(`ℹ️ ${message}`, 2000);
  }
}
