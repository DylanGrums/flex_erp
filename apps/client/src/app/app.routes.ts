import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/layouts/main-layout/main-layout.component';
import { PublicLayoutComponent } from './core/layout/layouts/public-layout/public-layout.component';
import { SettingsLayoutComponent } from './core/layout/layouts/settings-layout/settings-layout.component';
import { SettingsStorePage } from './pages/settings-store.page';
import { SettingsProfilePage } from './pages/settings-profile.page';
import { DataTableDemoPage } from './pages/data-table-demo.page';
import { authGuard } from '@flex-erp/auth/data-access';
import { requireStoreGuard } from '@flex-erp/shared/context/data-access';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [requireStoreGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'orders' },
      { path: 'data-table', component: DataTableDemoPage },
      {
        path: '',
        loadChildren: () =>
          import('@flex-erp/store/feature').then((m) => m.storeFeatureRoutes),
      },
      {
        path: 'store',
        loadChildren: () =>
          import('@flex-erp/store/feature').then((m) => m.storeFeatureRoutes),
      },
      {
        path: 'cms',
        loadChildren: () =>
          import('@flex-erp/cms/feature').then((m) => m.cmsFeatureRoutes),
      },
    ],
  },
  {
    path: 'login',
    component: PublicLayoutComponent,
    loadChildren: () =>
      import('@flex-erp/auth/feature').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'settings',
    component: SettingsLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'store' },
      { path: 'store', component: SettingsStorePage },
      { path: 'profile', component: SettingsProfilePage },
    ],
  },
];
