import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { filter, map, distinctUntilChanged, shareReplay, startWith } from 'rxjs';
import { FeAdminShellComponent } from '@flex-erp/store-ui';

type RouteMeta = {
  title?: string;
  subtitle?: string;
};

@Component({
  selector: 'fe-store-shell-layout',
  standalone: true,
  imports: [AsyncPipe, RouterOutlet, ButtonModule, FeAdminShellComponent],
  template: `
    <fe-admin-shell>
      <span shell-title>{{ pageTitle$ | async }}</span>
      <div shell-actions class="flex items-center gap-2">
        <button
          pButton
          type="button"
          label="Export"
          class="p-button-secondary"
          (click)="handleAction('export')"
        ></button>
        <button
          pButton
          type="button"
          label="Import"
          class="p-button-secondary"
          (click)="handleAction('import')"
        ></button>
        <button
          pButton
          type="button"
          label="Create"
          icon="pi pi-plus"
          (click)="handleAction('create')"
        ></button>
      </div>
      <router-outlet></router-outlet>
    </fe-admin-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreShellLayoutComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly routeMeta$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null),
    map(() => {
      let current = this.route;
      while (current.firstChild) {
        current = current.firstChild;
      }
      return (current.snapshot.data ?? {}) as RouteMeta;
    }),
    distinctUntilChanged(
      (a, b) => a.title === b.title && a.subtitle === b.subtitle,
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly pageTitle$ = this.routeMeta$.pipe(map((data) => data.title ?? ''));

  handleAction(action: string): void {
    void action;
  }
}
