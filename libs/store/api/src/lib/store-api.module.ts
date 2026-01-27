import { Module } from '@nestjs/common';

import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { StoresController } from './stores/stores.controller';
import { StoresService } from './stores/stores.service';

@Module({
  controllers: [ProductsController, StoresController],
  providers: [ProductsService, StoresService],
  exports: [],
})
export class StoreApiModule {}
