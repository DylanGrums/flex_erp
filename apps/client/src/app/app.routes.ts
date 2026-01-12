import { Routes } from '@angular/router';
import { DashboardPageComponent } from './modules/dashboard/dashboard-page.component';
import { DefaultLayoutComponent } from './core/layout/default-layout/default-layout.component';
import { ResidentManagementComponent } from './modules/resident/resident-management/resident-management.component';
import { UiKitDemoComponent } from './modules/dev/ui-kit-demo/ui-kit-demo.component';

export const routes: Routes = [
  {
    path: '', redirectTo: 'home', pathMatch: 'full'
  },
  {
    path: 'store',
    loadChildren: () =>
      import('@flex-erp/store-feature').then((m) => m.storeFeatureRoutes),
  },
  {
    path: '', component: DefaultLayoutComponent, children: [
      {
        path: 'home', component: DashboardPageComponent,
        data: {
          title: 'Dashboard',
          subtitle: 'Vue d\'ensemble des activités et statistiques clés.',
        },
      },
      {
        path: 'residents', component: ResidentManagementComponent,
        data: {
          title: 'Gestion des résidents',
          subtitle: 'Suivi des résidents, de leurs profils alimentaires et de leurs repas.',
        },
      },
      {
        path: 'dev/ui',
        component: UiKitDemoComponent,
        data: {
          title: 'Admin UI Kit',
          subtitle: 'Reusable UI building blocks for the admin experience.',
        },
      },
    ]
  },
];
