import { defineFeatureNav } from '@flex-erp/shared/nav';

export const STORE_NAV = defineFeatureNav({
  id: 'store',
  order: 10,
  sections: [
    {
      label: 'store.nav.section',
      items: [
        {
          icon: 'pi pi-shopping-cart',
          label: 'store.nav.orders',
          to: '/orders',
          type: 'core',
          route: {
            breadcrumb: 'store.routes.orders.breadcrumb',
            title: 'store.routes.orders.title',
            subtitle: 'store.routes.orders.subtitle',
          },
        },

        {
          icon: 'pi pi-tags',
          label: 'store.nav.products',
          to: '/products',
          type: 'core',
          route: {
            breadcrumb: 'store.routes.products.breadcrumb',
            title: 'store.routes.products.title',
            subtitle: 'store.routes.products.subtitle',
          },
          items: [
            {
              label: 'store.nav.collections',
              to: '/collections',
              route: {
                breadcrumb: 'store.routes.collections.breadcrumb',
                title: 'store.routes.collections.title',
                subtitle: 'store.routes.collections.subtitle',
              },
            },
            {
              label: 'store.nav.categories',
              to: '/categories',
              route: {
                breadcrumb: 'store.routes.categories.breadcrumb',
                title: 'store.routes.categories.title',
                subtitle: 'store.routes.categories.subtitle',
              },
            },
          ],
        },

        {
          icon: 'pi pi-building',
          label: 'store.nav.inventory',
          to: '/inventory',
          type: 'core',
          route: {
            breadcrumb: 'store.routes.inventory.breadcrumb',
            title: 'store.routes.inventory.title',
            subtitle: 'store.routes.inventory.subtitle',
          },
          items: [
            // You can later add /inventory/reservations and it will map to nested routes too
            { label: 'store.nav.reservations', to: '/reservations' },
          ],
        },

        {
          icon: 'pi pi-users',
          label: 'store.nav.customers',
          to: '/customers',
          type: 'core',
          route: {
            breadcrumb: 'store.routes.customers.breadcrumb',
            title: 'store.routes.customers.title',
            subtitle: 'store.routes.customers.subtitle',
          },
          items: [{ label: 'store.nav.customerGroups', to: '/customer-groups' }],
        },

        {
          icon: 'pi pi-percentage',
          label: 'store.nav.promotions',
          to: '/promotions',
          type: 'core',
          route: {
            breadcrumb: 'store.routes.promotions.breadcrumb',
            title: 'store.routes.promotions.title',
            subtitle: 'store.routes.promotions.subtitle',
          },
          items: [{ label: 'store.nav.campaigns', to: '/campaigns' }],
        },

        {
          icon: 'pi pi-dollar',
          label: 'store.nav.priceLists',
          to: '/price-lists',
          type: 'core',
          route: {
            breadcrumb: 'store.routes.priceLists.breadcrumb',
            title: 'store.routes.priceLists.title',
            subtitle: 'store.routes.priceLists.subtitle',
          },
        },
      ],
    },
  ],
});
