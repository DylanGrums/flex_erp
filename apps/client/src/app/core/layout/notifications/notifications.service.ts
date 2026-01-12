import { Injectable } from '@angular/core';

export type NotificationData = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  async list(): Promise<NotificationData[]> {
    return [
      {
        id: '1',
        title: 'Example notification',
        description: 'This is a placeholder notification feed item.',
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
    ];
  }
}
