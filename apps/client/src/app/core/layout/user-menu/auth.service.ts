import { Injectable, signal } from '@angular/core';

export type Me = {
  firstName?: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly me = signal<Me | null>({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
  });

  async logout(): Promise<void> {
    this.me.set(null);
  }
}
