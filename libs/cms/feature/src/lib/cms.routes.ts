import { Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { applyRouteMeta } from '@flex-erp/shared/nav';
import { CMS_NAV } from '@flex-erp/cms/manifest';
import { CmsShellComponent } from '@flex-erp/cms/ui';

import { CmsEditorPageComponent } from './cms-editor-page.component';
import { CmsEditorState } from '@flex-erp/cms/data-access';
import { provideDialogConfig } from 'ng-primitives/dialog';

const rawRoutes: Routes = [
  {
    path: '',
    component: CmsShellComponent,
    children: [
      {
        path: 'editor',
        component: CmsEditorPageComponent,
        providers: [
          importProvidersFrom(NgxsModule.forFeature([CmsEditorState])),
          ...provideDialogConfig({}),
        ],
      },
      { path: '', redirectTo: 'editor', pathMatch: 'full' },
    ],
  },
];

export const cmsFeatureRoutes: Routes = applyRouteMeta(
  rawRoutes,
  {
    ...CMS_NAV.nav.metaByPath,
    '/cms/editor': {
      ...CMS_NAV.nav.metaByPath['/cms/editor'],
      breadcrumb: Array.isArray(CMS_NAV.nav.metaByPath['/cms/editor']?.breadcrumb)
        ? (CMS_NAV.nav.metaByPath['/cms/editor'].breadcrumb as string[]).join(' > ')
        : CMS_NAV.nav.metaByPath['/cms/editor']?.breadcrumb,
    },
  }
);
