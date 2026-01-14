import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

import { RdxCollapsibleModule } from '@radix-ng/primitives/collapsible';
import { RdxTooltipModule } from '@radix-ng/primitives/tooltip';

export type ItemType = 'core' | 'extension' | 'setting';

export type NestedItem = {
  label: string;
  to: string;
  translationNs?: string;
};

export type NavItem = {
  icon?: string;
  label: string;
  to: string;
  items?: NestedItem[];
  type?: ItemType;
  from?: string;
  nested?: string;
  translationNs?: string;
};

export type GlobalShortcut = {
  to: string;
  label: string;
  keys: { Mac?: string[] };
};

const BASE_NAV_LINK_CLASSES =
  'text-ui-fg-subtle transition-fg hover:bg-ui-bg-subtle-hover flex items-center gap-x-2 rounded-md py-0.5 pl-0.5 pr-2 outline-none focus-visible:shadow-borders-focus [&>svg]:text-ui-fg-subtle [&>i]:text-ui-fg-subtle';
const ACTIVE_NAV_LINK_CLASSES =
  'bg-ui-bg-base shadow-elevation-card-rest text-ui-fg-base hover:bg-ui-bg-base';
const NESTED_NAV_LINK_CLASSES = 'pl-[34px] pr-2 py-1 w-full text-ui-fg-muted';
const SETTING_NAV_LINK_CLASSES = 'pl-2 py-1';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [RouterLink, RdxCollapsibleModule, RdxTooltipModule],
  templateUrl: './nav-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavItemComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly item = input.required<NavItem>();
  readonly shortcuts = input<GlobalShortcut[]>([]);
  readonly thenLabel = input<string>('then');
  readonly openDelay = input<number>(1500);

  private readonly pathname = signal(this.router.url);
  readonly open = signal(false);

  readonly type = computed<ItemType>(() => this.item().type ?? 'core');
  readonly isSetting = computed(() => this.type() === 'setting');

  readonly resolvedItems = computed(() => {
    const it = this.item();
    const parentTo = this.normalizePath(it.to);

    const items = it.items ?? [];
    return items.map((sub) => ({
      ...sub,
      to: this.resolveChildTo(parentTo, sub.to),
    }));
  });

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.pathname.set(this.router.url));

    effect(() => {
      const it = this.item();
      const parentTo = this.normalizePath(it.to);
      const childTos = this.resolvedItems().map((x) => x.to);
      this.open.set(this.getIsOpen(parentTo, childTos, this.pathname()));
    });
  }

  shortcutFor(to: string) {
    const key = this.normalizePath(to);
    return this.shortcuts().find((s) => this.normalizePath(s.to) === key) ?? null;
  }

  hasTooltipFor(to: string) {
    return !!this.shortcutFor(to);
  }

  isActive(to: string) {
    const normalizedTo = this.normalizePath(to);
    const path = this.normalizePath(this.pathname());
    return path.startsWith(normalizedTo);
  }

  navLinkClassNames(opts: {
    to: string;
    isActive: boolean;
    isNested?: boolean;
    isSetting?: boolean;
  }) {
    return this.clx(BASE_NAV_LINK_CLASSES, {
      [NESTED_NAV_LINK_CLASSES]: !!opts.isNested,
      [ACTIVE_NAV_LINK_CLASSES]: !!opts.isActive,
      [SETTING_NAV_LINK_CLASSES]: !!opts.isSetting,
    });
  }

  parentLinkExtraClasses() {
    return (this.item().items?.length ?? 0) > 0 ? 'max-lg:hidden' : '';
  }

  isExtension() {
    return this.type() === 'extension';
  }

  private normalizePath(p: string) {
    if (!p) return '/';
    return p.startsWith('/') ? p : `/${p}`;
  }

  private resolveChildTo(parentTo: string, childTo: string) {
    if (childTo.startsWith('/')) return this.normalizePath(childTo);

    const cleanParent = parentTo.endsWith('/') ? parentTo.slice(0, -1) : parentTo;
    const cleanChild = childTo.startsWith('/') ? childTo.slice(1) : childTo;

    return this.normalizePath(`${cleanParent}/${cleanChild}`);
  }

  private getIsOpen(parentTo: string, childTos: string[], pathname: string) {
    const path = this.normalizePath(pathname);
    return [parentTo, ...childTos].some((p) => path.startsWith(this.normalizePath(p)));
  }

  clx(base: string, cond: Record<string, boolean>) {
    const extra = Object.entries(cond)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(' ');
    return extra ? `${base} ${extra}` : base;
  }
}
