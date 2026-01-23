import { Controller, Get, Param, Req } from '@nestjs/common';
import { Request } from 'express';

import { ProductsService } from './products.service';

@Controller('stores/:storeId/products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Param('storeId') storeId: string, @Req() req: Request) {
    // TODO: replace with real tenant resolution when available.
    const tenantId = (req as any).user?.tenantId ?? null;
    return this.products.list(storeId, tenantId);
  }

  @Get(':id')
  getById(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    // TODO: replace with real tenant resolution when available.
    const tenantId = (req as any).user?.tenantId ?? null;
    return this.products.getById(storeId, id, tenantId);
  }
}
