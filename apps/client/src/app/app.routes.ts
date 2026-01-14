import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { PublicLayoutComponent } from './core/layout/public-layout/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'orders' },
      {
        path: '',
        loadChildren: () => import('@flex-erp/store-feature').then((m) => m.storeFeatureRoutes),
      },
    ],
  },
  {
    path: 'login',
    component: PublicLayoutComponent,
    children: [{ path: '', loadComponent: () => import('./pages/login.page').then((m) => m.LoginPage) }],
  },
];
