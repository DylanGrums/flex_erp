import { InjectionToken, Provider } from '@angular/core';

export type NavItem = {
  label: string;
  to: string;
  icon?: string;
  type?: 'core' | 'settings' | string;
  items?: NavItem[];
};

export type NavRouteMeta = {
  breadcrumb?: string;
  title?: string;
  subtitle?: string;
};

export type NavItemWithMeta = Omit<NavItem, 'items'> & {
  route?: NavRouteMeta;
  items?: NavItemWithMeta[];
};

export type NavManifest = {
  id: string;
  order?: number;
  items: NavItem[];
};

export const NAV_MANIFESTS = new InjectionToken<NavManifest[]>('NAV_MANIFESTS');

export function provideNavManifest(manifest: NavManifest): Provider {
  return { provide: NAV_MANIFESTS, multi: true, useValue: manifest };
}
