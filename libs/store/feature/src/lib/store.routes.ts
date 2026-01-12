import { Routes } from '@angular/router';
import { StoreOrdersPageComponent } from './pages/orders/orders.page';
import { StoreProductsPageComponent } from './pages/products/products.page';
import { StoreCollectionsPageComponent } from './pages/collections/collections.page';
import { StoreCategoriesPageComponent } from './pages/categories/categories.page';
import { StoreInventoryPageComponent } from './pages/inventory/inventory.page';
import { StoreCustomersPageComponent } from './pages/customers/customers.page';
import { StorePromotionsPageComponent } from './pages/promotions/promotions.page';
import { StorePriceListsPageComponent } from './pages/price-lists/price-lists.page';

export const storeFeatureRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'orders',
        component: StoreOrdersPageComponent,
        data: { breadcrumb: 'Orders', title: 'Orders', subtitle: 'Track orders, payments, and fulfillment.' },
      },
      {
        path: 'products',
        component: StoreProductsPageComponent,
        data: { breadcrumb: 'Products', title: 'Products', subtitle: 'Manage products, variants, and availability.' },
      },
      {
        path: 'collections',
        component: StoreCollectionsPageComponent,
        data: { breadcrumb: 'Collections', title: 'Collections', subtitle: 'Group products into curated collections.' },
      },
      {
        path: 'categories',
        component: StoreCategoriesPageComponent,
        data: { breadcrumb: 'Categories', title: 'Categories', subtitle: 'Organize products across your catalog.' },
      },
      {
        path: 'inventory',
        component: StoreInventoryPageComponent,
        data: { breadcrumb: 'Inventory', title: 'Inventory', subtitle: 'Track stock levels across locations.' },
      },
      {
        path: 'customers',
        component: StoreCustomersPageComponent,
        data: { breadcrumb: 'Customers', title: 'Customers', subtitle: 'Manage customer profiles and history.' },
      },
      {
        path: 'promotions',
        component: StorePromotionsPageComponent,
        data: { breadcrumb: 'Promotions', title: 'Promotions', subtitle: 'Create discounts and campaigns.' },
      },
      {
        path: 'price-lists',
        component: StorePriceListsPageComponent,
        data: { breadcrumb: 'Price Lists', title: 'Price Lists', subtitle: 'Configure price lists and overrides.' },
      },
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
    ],
  },
];
