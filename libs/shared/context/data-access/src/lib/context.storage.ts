import { Injectable } from '@angular/core';

import { AppContext } from './context.models';

export const CONTEXT_STORAGE_KEY = 'flex.context.v1';

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';

const isValidContext = (value: unknown): value is AppContext => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const ctx = value as AppContext;
  return isNullableString(ctx.tenantId) && isNullableString(ctx.storeId);
};

@Injectable({ providedIn: 'root' })
export class ContextStorage {
  read(): AppContext | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const raw = localStorage.getItem(CONTEXT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      return isValidContext(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  write(ctx: AppContext): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(ctx));
  }

  clear(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(CONTEXT_STORAGE_KEY);
  }
}
