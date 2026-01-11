import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
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
export class DefaultLayoutComponent implements OnInit {
  public isDarkMode = false;

  ref!: DynamicDialogRef | null;

  private readonly _dialogService = inject(DialogService);
  private readonly _store = inject(Store);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

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

  ngOnInit(): void {
    // Check local storage for user preference
    const darkModePreference = localStorage.getItem('darkMode');
    if (darkModePreference) {
      this.isDarkMode = darkModePreference === 'true';
      if (this.isDarkMode) {
        document.documentElement.classList.add('app-dark');
      } else {
        document.documentElement.classList.remove('app-dark');
      }
    } else {
      // If no preference, check system preference
      const prefersDark =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode = prefersDark;
      if (this.isDarkMode) {
        document.documentElement.classList.add('app-dark');
      } else {
        document.documentElement.classList.remove('app-dark');
      }
    }
  }

  toggleDarkMode() {
    const element = document.querySelector('html');
    if (element) {
      element.classList.toggle('app-dark');
      this.isDarkMode = element.classList.contains('app-dark');
      // Save preference to local storage
      localStorage.setItem('darkMode', this.isDarkMode ? 'true' : 'false');
    }
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
