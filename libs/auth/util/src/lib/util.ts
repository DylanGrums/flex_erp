import { InjectionToken } from '@angular/core';
import { AuthUser, JwtPayload } from '@flex-erp/auth/types';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const AUTH_STORAGE_KEYS = {
  accessToken: 'auth.accessToken',
  accessTokenExpiresAt: 'auth.accessTokenExpiresAt',
  user: 'auth.user',
} as const;

export type AuthStorageSnapshot = {
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  user: AuthUser | null;
};

type StorageKind = 'local' | 'session';

function getStorage(kind: StorageKind) {
  if (typeof window === 'undefined') return null;
  return kind === 'local' ? window.localStorage : window.sessionStorage;
}

export function readAuthStorage(kind: StorageKind = 'local'): AuthStorageSnapshot | null {
  const storage = getStorage(kind);
  if (!storage) return null;
  const userRaw = storage.getItem(AUTH_STORAGE_KEYS.user);
  return {
    accessToken: storage.getItem(AUTH_STORAGE_KEYS.accessToken),
    accessTokenExpiresAt: storage.getItem(AUTH_STORAGE_KEYS.accessTokenExpiresAt),
    user: userRaw ? (JSON.parse(userRaw) as AuthUser) : null,
  };
}

export function writeAuthStorage(snapshot: AuthStorageSnapshot, kind: StorageKind = 'local') {
  const storage = getStorage(kind);
  if (!storage) return;
  if (snapshot.accessToken) {
    storage.setItem(AUTH_STORAGE_KEYS.accessToken, snapshot.accessToken);
  }
  if (snapshot.accessTokenExpiresAt) {
    storage.setItem(AUTH_STORAGE_KEYS.accessTokenExpiresAt, snapshot.accessTokenExpiresAt);
  }
  if (snapshot.user) {
    storage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(snapshot.user));
  }
}

export function clearAuthStorage(kind: StorageKind = 'local') {
  const storage = getStorage(kind);
  if (!storage) return;
  storage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  storage.removeItem(AUTH_STORAGE_KEYS.accessTokenExpiresAt);
  storage.removeItem(AUTH_STORAGE_KEYS.user);
}

function decodeBase64Url(value: string): string | null {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  if (typeof atob === 'function') {
    return atob(padded);
  }

  return null;
}

export function decodeJwtPayload<T = JwtPayload>(token: string): T | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const decoded = decodeBase64Url(parts[1]);
  if (!decoded) return null;
  try {
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}
