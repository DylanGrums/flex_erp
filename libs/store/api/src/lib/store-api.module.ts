import { Module } from '@nestjs/common';

import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { StoresController } from './stores/stores.controller';
import { StoresService } from './stores/stores.service';
import { PromotionsController } from './promotions/promotions.controller';
import { PromotionsService } from './promotions/promotions.service';
import { CampaignsController } from './campaigns/campaigns.controller';
import { CampaignsService } from './campaigns/campaigns.service';

@Module({
  controllers: [
    ProductsController,
    StoresController,
    PromotionsController,
    CampaignsController,
  ],
  providers: [
    ProductsService,
    StoresService,
    PromotionsService,
    CampaignsService,
  ],
  exports: [],
})
export class StoreApiModule {}
