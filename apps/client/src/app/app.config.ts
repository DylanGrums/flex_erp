import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  inject,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTransloco, translocoConfig } from '@jsverse/transloco';
import { NgxsModule, Store } from '@ngxs/store';
import {
  AuthState,
  Refresh,
  authInterceptor,
} from '@flex-erp/auth/data-access';
import { ProductsState } from '@flex-erp/store/data-access';
import {
  ContextState,
  contextInterceptor,
  provideAppContext,
} from '@flex-erp/shared/context/data-access';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { environment } from '../environments/environment';
import { catchError, of, firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '@flex-erp/auth/util';
import { ThemeService } from './shared/theme/theme.service';
import { STORE_NAV } from '@flex-erp/store/manifest';
import { provideNavManifest } from '@flex-erp/shared/nav';
import { TranslocoHttpLoader } from './transloco-loader';
import { I18nInitService } from './shared/i18n/i18n-init.service';
import { CMS_NAV } from '@flex-erp/cms/manifest';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, contextInterceptor])),
    provideTransloco({
      config: translocoConfig({
        availableLangs: ['fr', 'en'],
        defaultLang: 'fr',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      }),
      loader: TranslocoHttpLoader,
    }),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },

    // NGXS via functional providers
    importProvidersFrom(
      NgxsModule.forRoot([AuthState, ProductsState, ContextState], {
        developmentMode: !environment.production,
      }),
      NgxsLoggerPluginModule.forRoot({ disabled: environment.production }),
      NgxsReduxDevtoolsPluginModule.forRoot({
        disabled: environment.production,
      }),
    ),

    // Silent refresh on app start (uses refresh cookie)
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [Store],
      useFactory: (store: Store) => () =>
        firstValueFrom(
          store.dispatch(new Refresh()).pipe(catchError(() => of(null))),
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
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const i18nInitService = inject(I18nInitService);
        return () => i18nInitService.init();
      },
    },
    provideAnimationsAsync(),
    provideNavManifest(STORE_NAV.nav.manifest),
    provideNavManifest(CMS_NAV.nav.manifest),
    ...provideAppContext(),
  ],
};
