import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/layouts/main-layout/main-layout.component';
import { PublicLayoutComponent } from './core/layout/layouts/public-layout/public-layout.component';
import { SettingsLayoutComponent } from './core/layout/layouts/settings-layout/settings-layout.component';
import { SettingsStorePage } from './pages/settings-store.page';
import { SettingsProfilePage } from './pages/settings-profile.page';
import { authGuard } from '@flex-erp/auth/feature';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'orders' },
      {
        path: '',
        loadChildren: () => import('@flex-erp/store/feature').then((m) => m.storeFeatureRoutes),
      },
      {
        path: 'cms',
        loadChildren: () => import('@flex-erp/feature').then((m) => m.cmsFeatureRoutes),
      },
    ],
  },
  {
    path: 'login',
    component: PublicLayoutComponent,
    loadChildren: () => import('@flex-erp/auth/feature').then((m) => m.AUTH_ROUTES),
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
