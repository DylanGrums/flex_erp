import { InjectionToken, Provider } from '@angular/core';
import type { LucideIconData } from 'lucide-angular';

export type NavItem = {
  label: string;
  to: string;
  icon?: LucideIconData;
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

export type NavSection = {
  label: string;
  order?: number;
  items: NavItem[];
  dividerAfter?: boolean;
};

export type NavManifest = {
  id: string;
  order?: number;
  sections: NavSection[];
};

export const NAV_MANIFESTS = new InjectionToken<NavManifest[]>('NAV_MANIFESTS');

export function provideNavManifest(manifest: NavManifest): Provider {
  return { provide: NAV_MANIFESTS, multi: true, useValue: manifest };
}
