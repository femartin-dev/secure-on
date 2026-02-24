import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface ConfigPage {
  id: string;
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-config-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './config-layout.component.html',
  styleUrl: './config-layout.component.css'
})
export class ConfigLayoutComponent {

  pages: ConfigPage[] = [
    { id: 'contacts', label: 'Contactos', icon: 'contacts', route: '/settings/contacts' },
    // Future pages:
    // { id: 'general', label: 'General', icon: 'tune', route: '/settings/general' },
    // { id: 'security', label: 'Seguridad', icon: 'shield', route: '/settings/security' },
    // { id: 'notifications', label: 'Notificaciones', icon: 'notifications', route: '/settings/notifications' },
  ];

  currentPageIndex = 0;

  constructor(private router: Router) {
    // Determine current page from URL
    const url = this.router.url;
    const idx = this.pages.findIndex(p => url.includes(p.id));
    if (idx >= 0) this.currentPageIndex = idx;
  }

  get currentPage(): ConfigPage {
    return this.pages[this.currentPageIndex];
  }

  get canGoPrev(): boolean {
    return this.currentPageIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentPageIndex < this.pages.length - 1;
  }

  goPrev(): void {
    if (this.canGoPrev) {
      this.currentPageIndex--;
      this.router.navigate([this.currentPage.route]);
    }
  }

  goNext(): void {
    if (this.canGoNext) {
      this.currentPageIndex++;
      this.router.navigate([this.currentPage.route]);
    }
  }

  goBack(): void {
    this.router.navigate(['/main']);
  }
}
