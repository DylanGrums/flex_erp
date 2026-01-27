import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductsService,
} from './products.service';

@UseGuards(AuthGuard('jwt'))
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) { }

  @Get()
  async list(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    if (!storeId || !tenantId) throw new UnauthorizedException();
    return this.products.list(storeId, tenantId);
  }

  @Get(':id')
  async getById(
    @Headers('x-store-id') storeId: string | undefined,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    if (!storeId || !tenantId) throw new UnauthorizedException();
    const product = await this.products.getById(storeId, id, tenantId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Post()
  async create(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: ProductCreatePayload,
  ) {
    if (!payload?.title) {
      throw new BadRequestException('Title is required');
    }
    if (!storeId || !tenantId) throw new UnauthorizedException();
    return this.products.create(storeId, tenantId, {
      title: payload.title,
      handle: payload.handle ?? null,
      status: payload.status ?? 'DRAFT',
      options: payload.options ?? [],
      variants: payload.variants ?? [],
      images: payload.images ?? [],
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: ProductUpdatePayload,
  ) {
    if (!storeId || !tenantId) throw new UnauthorizedException();
    const product = await this.products.update(storeId, id, tenantId, payload);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }


}
