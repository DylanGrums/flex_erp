import { Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { CmsEditorPageComponent } from './cms-editor-page.component';
import { CmsEditorState } from '@flex-erp/data-access';
import { provideRdxDialog, provideRdxDialogConfig } from '@radix-ng/primitives/dialog';

export const cmsFeatureRoutes: Routes = [
  {
    path: 'editor',
    component: CmsEditorPageComponent,
    providers: [
      importProvidersFrom(NgxsModule.forFeature([CmsEditorState])),
      provideRdxDialogConfig(),
      provideRdxDialog(),
    ],
  },
];
