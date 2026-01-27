import { Routes } from '@angular/router';
import { applyRouteMeta } from '@flex-erp/shared/nav';
import { STORE_NAV } from '@flex-erp/store/manifest';

import { StoreOrdersPageComponent } from './pages/orders/orders.page';
import { ProductCreateComponent } from './product-editor/product-create.component';
import { ProductEditComponent } from './product-editor/product-edit.component';
import { StoreCollectionsPageComponent } from './pages/collections/collections.page';
import { StoreCategoriesPageComponent } from './pages/categories/categories.page';
import { StoreInventoryPageComponent } from './pages/inventory/inventory.page';
import { StoreCustomersPageComponent } from './pages/customers/customers.page';
import { StorePromotionsPageComponent } from './pages/promotions/promotions.page';
import { StorePriceListsPageComponent } from './pages/price-lists/price-lists.page';
import { StoreProductsPageComponent } from './pages/products/products.page';

const rawRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: StoreProductsPageComponent },
      { path: 'orders', component: StoreOrdersPageComponent },
      { path: 'products', component: StoreProductsPageComponent },
      { path: 'products/new', component: ProductCreateComponent },
      { path: 'products/:id', component: ProductEditComponent },
      { path: 'collections', component: StoreCollectionsPageComponent },
      { path: 'categories', component: StoreCategoriesPageComponent },
      { path: 'inventory', component: StoreInventoryPageComponent },
      { path: 'customers', component: StoreCustomersPageComponent },
      { path: 'promotions', component: StorePromotionsPageComponent },
      { path: 'price-lists', component: StorePriceListsPageComponent },
    ],
  },
];

// ✅ Auto-apply breadcrumb/title/subtitle from STORE_FEATURE.nav.metaByPath
export const storeFeatureRoutes: Routes = applyRouteMeta(
  rawRoutes,
  STORE_NAV.nav.metaByPath,
);
