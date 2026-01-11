import { Routes } from '@angular/router';
import { DashboardPageComponent } from './modules/dashboard/dashboard-page.component';
import { DefaultLayoutComponent } from './modules/dashboard/core/layout/default-layout/default-layout.component';
import { ResidentManagementComponent } from './modules/resident/resident-management/resident-management.component';

export const routes: Routes = [
  {
    path: '', redirectTo: 'home', pathMatch: 'full'
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
    ]
  },
];
