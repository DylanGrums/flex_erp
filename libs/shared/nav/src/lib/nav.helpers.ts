import type { Routes } from '@angular/router';
import type { NavItem, NavItemWithMeta, NavManifest, NavRouteMeta } from './nav.registry';

export type FeatureDefinition = {
  id: string;
  order?: number;
  nav: {
    manifest: NavManifest;
    metaByPath: Record<string, NavRouteMeta>;
  };
};

function normalizeToPath(to: string): string {
  const clean = to.split('?')[0]?.split('#')[0] ?? to;
  return clean.replace(/^\/+/, '').replace(/\/+$/, '');
}

function stripMeta(items: NavItemWithMeta[]): NavItem[] {
  return items.map((i) => ({
    label: i.label,
    to: i.to,
    icon: i.icon,
    type: i.type,
    items: i.items ? stripMeta(i.items) : undefined,
  }));
}

function collectMeta(items: NavItemWithMeta[], acc: Record<string, NavRouteMeta>): void {
  for (const item of items) {
    if (item.route) {
      const key = normalizeToPath(item.to);
      if (key) acc[key] = item.route;
    }
    if (item.items?.length) collectMeta(item.items, acc);
  }
}

export function defineFeatureNav(args: {
  id: string;
  order?: number;
  items: NavItemWithMeta[];
}): FeatureDefinition {
  const metaByPath: Record<string, NavRouteMeta> = {};
  collectMeta(args.items, metaByPath);

  return {
    id: args.id,
    order: args.order,
    nav: {
      manifest: {
        id: args.id,
        order: args.order,
        items: stripMeta(args.items),
      },
      metaByPath,
    },
  };
}

export function applyRouteMeta(routes: Routes, metaByPath: Record<string, NavRouteMeta>): Routes {
  const visit = (rs: Routes, prefix: string): Routes =>
    rs.map((r) => {
      const path = r.path ?? '';
      const full = path === '' ? prefix : prefix ? `${prefix}/${path}` : path;

      const meta = metaByPath[full];

      const next: any = {
        ...r,
        data: meta ? { ...(r.data ?? {}), ...meta } : r.data,
      };

      if (r.children?.length) next.children = visit(r.children, full);
      return next;
    });

  return visit(routes, '');
}
