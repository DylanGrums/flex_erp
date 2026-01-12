import { Injectable, signal } from '@angular/core';

export type StoreInfo = { name: string };

@Injectable({ providedIn: 'root' })
export class StoreService {
  readonly store = signal<StoreInfo | null>({ name: 'My Store' });
}
