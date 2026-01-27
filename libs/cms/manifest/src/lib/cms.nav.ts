import { defineFeatureNav } from '@flex-erp/shared/nav';
import { Pencil } from 'lucide-angular';

export const CMS_NAV = defineFeatureNav({
  id: 'cms',
  order: 20,
  sections: [
    {
      label: 'cms.nav.section',
      items: [
        {
          icon: Pencil,
          label: 'cms.nav.editor',
          to: 'cms/editor',
          type: 'core',
          route: {
            breadcrumb: 'cms.routes.editor.breadcrumb',
            title: 'cms.routes.editor.title',
            subtitle: 'cms.routes.editor.subtitle',
          },
        },
      ],
    },
  ],
});
