import { routes } from './app.routes';
import { MainLayoutComponent } from './core/layout/layouts/main-layout/main-layout.component';
import { SettingsLayoutComponent } from './core/layout/layouts/settings-layout/settings-layout.component';
import { PublicLayoutComponent } from './core/layout/layouts/public-layout/public-layout.component';
import { SettingsStorePage } from './pages/settings-store.page';
import { SettingsProfilePage } from './pages/settings-profile.page';
import { DataTableDemoPage } from './pages/data-table-demo.page';

describe('app.routes', () => {
  it('defines layouts and key child routes', () => {
    const mainRoute = routes.find((r) => r.component === MainLayoutComponent);
    expect(mainRoute).toBeDefined();
    expect(mainRoute?.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '',
          pathMatch: 'full',
          redirectTo: 'orders',
        }),
        expect.objectContaining({
          path: 'data-table',
          component: DataTableDemoPage,
        }),
      ]),
    );

    const settingsRoute = routes.find(
      (r) => r.component === SettingsLayoutComponent,
    );
    expect(settingsRoute).toBeDefined();
    expect(settingsRoute?.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '',
          pathMatch: 'full',
          redirectTo: 'store',
        }),
        expect.objectContaining({
          path: 'store',
          component: SettingsStorePage,
        }),
        expect.objectContaining({
          path: 'profile',
          component: SettingsProfilePage,
        }),
      ]),
    );

    const loginRoute = routes.find(
      (r) => r.component === PublicLayoutComponent,
    );
    expect(loginRoute).toBeDefined();
    expect(loginRoute?.path).toBe('login');
  });
});
