import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';

import { NotificationsService, NotificationData } from './notifications.service';

const LAST_READ_NOTIFICATION_KEY = 'notificationsLastReadAt';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, ButtonModule, DrawerModule, DividerModule],
  templateUrl: './notifications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  private readonly api = inject(NotificationsService);

  readonly open = signal(false);
  readonly hasUnread = signal(false);
  readonly lastReadAt = signal<string | null>(localStorage.getItem(LAST_READ_NOTIFICATION_KEY));
  readonly items = signal<NotificationData[]>([]);

  constructor() {
    this.refreshUnread();
    setInterval(() => this.refreshUnread(), 60_000);
  }

  async toggle(): Promise<void> {
    const next = !this.open();
    await this.setOpen(next);
  }

  async setOpen(shouldOpen: boolean): Promise<void> {
    if (shouldOpen) {
      this.hasUnread.set(false);
      this.open.set(true);
      localStorage.setItem(LAST_READ_NOTIFICATION_KEY, new Date().toISOString());
      this.items.set(await this.api.list());
    } else {
      this.open.set(false);
      this.lastReadAt.set(localStorage.getItem(LAST_READ_NOTIFICATION_KEY));
    }
  }

  isUnread(n: NotificationData): boolean {
    const lr = this.lastReadAt();
    const lrTs = lr ? Date.parse(lr) : 0;
    return Date.parse(n.createdAt) > lrTs;
  }

  private async refreshUnread(): Promise<void> {
    const latest = (await this.api.list())[0];
    if (!latest) return;

    const lastRead = localStorage.getItem(LAST_READ_NOTIFICATION_KEY);
    const lastReadTs = lastRead ? Date.parse(lastRead) : 0;

    if (Date.parse(latest.createdAt) > lastReadTs) {
      this.hasUnread.set(true);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (e.key.toLowerCase() === 'n' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void this.toggle();
    }
  }
}
