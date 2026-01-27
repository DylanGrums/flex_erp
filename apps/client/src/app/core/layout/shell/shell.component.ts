import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, HostListener, TemplateRef, inject, signal } from '@angular/core';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

import { TranslocoModule } from '@jsverse/transloco';
import { LucideAngularModule, Menu, X } from 'lucide-angular';

import { SidebarService } from '../services/sidebar.service';
import { BreadcrumbsService } from '../services/breadcrumbs.service';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { LanguageSwitcherComponent } from '../../../shared/i18n/language-switcher.component';
import { FlexDialogComponent, FlexProgressBarComponent } from '@flex-erp/shared/ui';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FlexDialogComponent,
    FlexProgressBarComponent,
    LucideAngularModule,
    TranslocoModule,
    NotificationsComponent,
    LanguageSwitcherComponent,
  ],
  templateUrl: './shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  readonly Menu = Menu;
  readonly X = X;

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
