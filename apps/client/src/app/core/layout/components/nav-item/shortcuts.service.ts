import { Injectable } from '@angular/core';

export type Shortcut = {
  to: string;
  label: string;
  keys: { Mac?: string[]; Win?: string[] };
};

@Injectable({ providedIn: 'root' })
export class ShortcutsService {
  readonly shortcuts: Shortcut[] = [
    { to: '/orders', label: 'Go to Orders', keys: { Mac: ['⌘', 'O'] } },
    { to: '/products', label: 'Go to Products', keys: { Mac: ['⌘', 'P'] } },
  ];

  find(to: string): Shortcut | undefined {
    return this.shortcuts.find((s) => s.to === to);
  }
}
