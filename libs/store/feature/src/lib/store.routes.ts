import { Routes } from '@angular/router';
import { StoreShellLayoutComponent } from './shell/store-shell-layout.component';
import { StoreOrdersPageComponent } from './pages/orders/orders.page';
import { StoreProductsPageComponent } from './pages/products/products.page';
import { StoreCollectionsPageComponent } from './pages/collections/collections.page';
import { StoreCategoriesPageComponent } from './pages/categories/categories.page';
import { StoreInventoryPageComponent } from './pages/inventory/inventory.page';
import { StoreCustomersPageComponent } from './pages/customers/customers.page';
import { StorePromotionsPageComponent } from './pages/promotions/promotions.page';
import { StorePriceListsPageComponent } from './pages/price-lists/price-lists.page';
import { StoreSettingsPageComponent } from './pages/settings/settings.page';

export const storeFeatureRoutes: Routes = [
  {
    path: '',
    component: StoreShellLayoutComponent,
    children: [
      {
        path: 'orders',
        component: StoreOrdersPageComponent,
        data: {
          title: 'Orders',
          subtitle: 'Track orders, payments, and fulfillment.',
        },
      },
      {
        path: 'products',
        component: StoreProductsPageComponent,
        data: {
          title: 'Products',
          subtitle: 'Manage products, variants, and availability.',
        },
      },
      {
        path: 'collections',
        component: StoreCollectionsPageComponent,
        data: {
          title: 'Collections',
          subtitle: 'Group products into curated collections.',
        },
      },
      {
        path: 'categories',
        component: StoreCategoriesPageComponent,
        data: {
          title: 'Categories',
          subtitle: 'Organize products across your catalog.',
        },
      },
      {
        path: 'inventory',
        component: StoreInventoryPageComponent,
        data: {
          title: 'Inventory',
          subtitle: 'Track stock levels across locations.',
        },
      },
      {
        path: 'customers',
        component: StoreCustomersPageComponent,
        data: {
          title: 'Customers',
          subtitle: 'Manage customer profiles and history.',
        },
      },
      {
        path: 'promotions',
        component: StorePromotionsPageComponent,
        data: {
          title: 'Promotions',
          subtitle: 'Create discounts and campaigns.',
        },
      },
      {
        path: 'price-lists',
        component: StorePriceListsPageComponent,
        data: {
          title: 'Price Lists',
          subtitle: 'Configure price lists and overrides.',
        },
      },
      {
        path: 'settings',
        component: StoreSettingsPageComponent,
        data: {
          title: 'Settings',
          subtitle: 'Store preferences, users, and access.',
        },
      },
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full',
      },
    ],
  },
];
