import { defineFeatureNav } from '@flex-erp/shared/nav';

export const STORE_NAV = defineFeatureNav({
  id: 'store',
  order: 10,
  items: [
    {
      icon: 'pi pi-shopping-cart',
      label: 'Orders',
      to: '/orders',
      type: 'core',
      route: {
        breadcrumb: 'Orders',
        title: 'Orders',
        subtitle: 'Track orders, payments, and fulfillment.',
      },
    },

    {
      icon: 'pi pi-tags',
      label: 'Products',
      to: '/products',
      type: 'core',
      route: {
        breadcrumb: 'Products',
        title: 'Products',
        subtitle: 'Manage products, variants, and availability.',
      },
      items: [
        {
          label: 'Collections',
          to: '/collections',
          route: {
            breadcrumb: 'Collections',
            title: 'Collections',
            subtitle: 'Group products into curated collections.',
          },
        },
        {
          label: 'Categories',
          to: '/categories',
          route: {
            breadcrumb: 'Categories',
            title: 'Categories',
            subtitle: 'Organize products across your catalog.',
          },
        },
      ],
    },

    {
      icon: 'pi pi-building',
      label: 'Inventory',
      to: '/inventory',
      type: 'core',
      route: {
        breadcrumb: 'Inventory',
        title: 'Inventory',
        subtitle: 'Track stock levels across locations.',
      },
      items: [
        // You can later add /inventory/reservations and it will map to nested routes too
        { label: 'Reservations', to: '/reservations' },
      ],
    },

    {
      icon: 'pi pi-users',
      label: 'Customers',
      to: '/customers',
      type: 'core',
      route: {
        breadcrumb: 'Customers',
        title: 'Customers',
        subtitle: 'Manage customer profiles and history.',
      },
      items: [{ label: 'Customer Groups', to: '/customer-groups' }],
    },

    {
      icon: 'pi pi-percentage',
      label: 'Promotions',
      to: '/promotions',
      type: 'core',
      route: {
        breadcrumb: 'Promotions',
        title: 'Promotions',
        subtitle: 'Create discounts and campaigns.',
      },
      items: [{ label: 'Campaigns', to: '/campaigns' }],
    },

    {
      icon: 'pi pi-dollar',
      label: 'Price Lists',
      to: '/price-lists',
      type: 'core',
      route: {
        breadcrumb: 'Price Lists',
        title: 'Price Lists',
        subtitle: 'Configure price lists and overrides.',
      },
    },
  ],
});
