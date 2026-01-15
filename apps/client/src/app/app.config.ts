import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { FlexPreset } from '../themes/flex.preset';
import { NgxsModule, Store } from '@ngxs/store';
import { AuthState, Refresh, authInterceptor } from '@flex-erp/auth/data-access';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { environment } from '../environments/environment';
import { DynamicDialogModule, DialogService } from 'primeng/dynamicdialog';
import { catchError, of, firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '@flex-erp/auth/util';
import { ThemeService } from './shared/theme/theme.service';
import { STORE_NAV } from '@flex-erp/store/manifest';
import { provideNavManifest } from '@flex-erp/shared/nav';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },

    // NGXS via functional providers
    importProvidersFrom(
      NgxsModule.forRoot([AuthState], { developmentMode: !environment.production }),
      NgxsLoggerPluginModule.forRoot({ disabled: environment.production }),
      NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production }),
      DynamicDialogModule,
    ),

    // Silent refresh on app start (uses refresh cookie)
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [Store],
      useFactory: (store: Store) => () =>
        firstValueFrom(
          store.dispatch(new Refresh()).pipe(
            catchError(() => of(null))
          )
        ),
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const themeService = inject(ThemeService);
        return () => themeService.init();
      },
    },
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: FlexPreset,
        options: {
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primeng',
            order: 'app-styles, primeng'
          }
        }
      }
    }),
    DialogService,
    provideNavManifest(STORE_NAV.nav.manifest),
  ],
};
