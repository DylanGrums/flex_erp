import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, HostListener, TemplateRef, inject, signal } from '@angular/core';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';

import { SidebarService } from '../services/sidebar.service';
import { BreadcrumbsService } from '../services/breadcrumbs.service';
import { NotificationsComponent } from '../components/notifications/notifications.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, DialogModule, ProgressBarModule, NotificationsComponent],
  templateUrl: './shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly router = inject(Router);
  readonly sidebar = inject(SidebarService);
  readonly breadcrumbs = inject(BreadcrumbsService);

  readonly loading = signal(false);
  @ContentChild('sidebar', { read: TemplateRef }) sidebarTemplate?: TemplateRef<unknown>;

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationStart)).subscribe(() => {
      this.loading.set(true);
      setTimeout(() => this.loading.set(false), 300);
    });
  }

  toggleDesktop(): void {
    this.sidebar.toggle('desktop');
  }

  toggleMobile(): void {
    this.sidebar.toggle('mobile');
  }

  closeMobile(): void {
    this.sidebar.setMobile(false);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.sidebar.mobileOpen()) {
      this.closeMobile();
    }
  }
}
