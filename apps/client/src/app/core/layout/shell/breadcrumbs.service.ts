import { Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export type Breadcrumb = { label: string; path: string };

@Injectable({ providedIn: 'root' })
export class BreadcrumbsService {
  private readonly crumbsSig = signal<Breadcrumb[]>([]);
  readonly crumbs = computed(() => this.crumbsSig());

  private readonly router = inject(Router);

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      const root = this.router.routerState.snapshot.root;
      this.crumbsSig.set(this.build(root));
    });

    const root = this.router.routerState.snapshot.root;
    this.crumbsSig.set(this.build(root));
  }

  private build(route: ActivatedRouteSnapshot, acc: Breadcrumb[] = [], url = ''): Breadcrumb[] {
    const segment = route.url
      .map((s) => s.path)
      .filter(Boolean)
      .join('/');
    const nextUrl = segment ? `${url}/${segment}` : url;

    const bc = route.data?.['breadcrumb'] as string | undefined;
    if (bc) acc.push({ label: bc, path: nextUrl || '/' });

    const primaryChild = route.children.find((c) => c.outlet === 'primary');
    return primaryChild ? this.build(primaryChild, acc, nextUrl) : acc;
  }
}
