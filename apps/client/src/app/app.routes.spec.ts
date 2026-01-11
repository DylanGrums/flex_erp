import { routes } from './app.routes';
import { DefaultLayoutComponent } from './core/layout/default-layout/default-layout.component';
import { DashboardPageComponent } from './modules/dashboard/dashboard-page.component';
import { ResidentManagementComponent } from './modules/resident/resident-management/resident-management.component';
import { UiKitDemoComponent } from './modules/dev/ui-kit-demo/ui-kit-demo.component';

describe('app.routes', () => {
  it('defines redirect and layout children', () => {
    expect(routes[0]).toMatchObject({
      path: '',
      redirectTo: 'home',
      pathMatch: 'full',
    });

    const layoutRoute = routes.find(
      (r) => r.component === DefaultLayoutComponent,
    );
    expect(layoutRoute).toBeDefined();
    expect(layoutRoute?.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'home',
          component: DashboardPageComponent,
        }),
        expect.objectContaining({
          path: 'residents',
          component: ResidentManagementComponent,
        }),
        expect.objectContaining({
          path: 'dev/ui',
          component: UiKitDemoComponent,
        }),
      ]),
    );
  });
});
