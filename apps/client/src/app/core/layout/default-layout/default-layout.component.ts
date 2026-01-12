import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { LoginComponent } from '../../auth/feature/login/login.component';
import { Store } from '@ngxs/store';
import { User } from 'generated/prisma/client';
import { AsyncPipe } from '@angular/common';
import {
  Observable,
  tap,
  filter,
  map,
  distinctUntilChanged,
  shareReplay,
  startWith,
} from 'rxjs';
import { AuthState } from '../../auth/data-access/auth.state';
import { ThemeService } from '../../../shared/theme/theme.service';

type RouteMeta = {
  title?: string;
  subtitle?: string;
};

@Component({
  selector: 'app-default-layout',
  imports: [
    RouterOutlet,
    SidebarComponent,
    InputTextModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    AsyncPipe,
  ],
  templateUrl: './default-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultLayoutComponent {

  ref!: DynamicDialogRef | null;

  private readonly _dialogService = inject(DialogService);
  private readonly _store = inject(Store);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _themeService = inject(ThemeService);

  public readonly isDarkMode = this._themeService.isDarkMode;

  public user$: Observable<User | null> = this._store
    .select(AuthState.user)
    .pipe(tap((user) => console.log('User data:', user)));

  /**
   * Route meta (title + subtitle) for the currently active route
   */
  private readonly routeMeta$: Observable<RouteMeta> = this._router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    // emit once immediately for initial load
    startWith(null),
    map(() => {
      // Get deepest activated route
      let current = this._route;
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

  // Exposed observables for the template
  public readonly pageTitle$ = this.routeMeta$.pipe(
    map((d) => d.title ?? ''),
  );

  public readonly pageSubtitle$ = this.routeMeta$.pipe(
    map((d) => d.subtitle ?? ''),
  );

  toggleDarkMode() {
    this._themeService.toggle();
  }

  openLoginDialog() {
    this.ref = this._dialogService.open(LoginComponent, {
      header: 'Login',
      width: '400px',
      closable: true,
    });

    this.ref?.onClose.subscribe((x: any) => {
      console.log('Login dialog closed', x);
      this.ref = null;
    });
  }
}
