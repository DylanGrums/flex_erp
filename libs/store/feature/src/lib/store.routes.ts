import { Routes } from '@angular/router';
import { applyRouteMeta } from '@flex-erp/shared/nav';
import { STORE_NAV } from '@flex-erp/store/manifest';
import { StoreShellComponent } from '@flex-erp/store/ui';

import { StoreOrdersPageComponent } from './pages/orders/orders.page';
import { ProductCreateComponent } from './product-editor/product-create.component';
import { ProductDetailPageComponent } from './pages/product-detail/product-detail.page';
import { ProductGeneralEditDialogComponent } from './product-detail/dialogs/product-general-edit.dialog';
import { ProductMediaEditDialogComponent } from './product-detail/dialogs/product-media-edit.dialog';
import { ProductOptionCreateDialogComponent } from './product-detail/dialogs/product-option-create.dialog';
import { ProductOptionEditDialogComponent } from './product-detail/dialogs/product-option-edit.dialog';
import { ProductVariantCreateDialogComponent } from './product-detail/dialogs/product-variant-create.dialog';
import { ProductVariantEditDialogComponent } from './product-detail/dialogs/product-variant-edit.dialog';
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
    component: StoreShellComponent,
    children: [
      { path: '', component: StoreProductsPageComponent },
      { path: 'orders', component: StoreOrdersPageComponent },
      { path: 'products', component: StoreProductsPageComponent },
      { path: 'products/new', component: ProductCreateComponent },
      {
        path: 'products/:id',
        component: ProductDetailPageComponent,
        children: [
          { path: 'edit', component: ProductGeneralEditDialogComponent },
          { path: 'media/edit', component: ProductMediaEditDialogComponent },
          { path: 'options/create', component: ProductOptionCreateDialogComponent },
          { path: 'options/:optionId/edit', component: ProductOptionEditDialogComponent },
          { path: 'variants/create', component: ProductVariantCreateDialogComponent },
          { path: 'variants/:variantId/edit', component: ProductVariantEditDialogComponent },
        ],
      },
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
