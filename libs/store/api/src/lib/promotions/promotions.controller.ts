import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  PromotionCreatePayload,
  PromotionRulesReplacePayload,
  PromotionStatus,
  PromotionStatusUpdatePayload,
  PromotionUpdatePayload,
} from '@flex-erp/store/types';
import { PromotionsService } from './promotions.service';

@UseGuards(AuthGuard('jwt'))
@Controller('store/promotions')
export class PromotionsController {
  constructor(private readonly promotions: PromotionsService) {}

  @Get()
  async list(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('isActive') isActive?: string,
    @Query('campaignId') campaignId?: string,
  ) {
    this.requireContext(storeId, tenantId);

    const statusValue = status?.trim().toUpperCase();
    if (statusValue && !this.promotions.isStatusSupported(statusValue)) {
      throw new BadRequestException('Invalid status');
    }

    return this.promotions.list(storeId!, tenantId!, {
      limit: this.parseNumber(limit),
      offset: this.parseNumber(offset),
      q: q?.trim() || null,
      status: (statusValue as PromotionStatus) ?? null,
      isActive: this.parseBoolean(isActive),
      campaignId: campaignId ?? null,
    });
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    const promotion = await this.promotions.getById(storeId!, tenantId!, id);
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }
    return promotion;
  }

  @Post()
  async create(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: PromotionCreatePayload,
  ) {
    this.requireContext(storeId, tenantId);
    if (!payload?.code?.trim()) {
      throw new BadRequestException('Code is required');
    }
    if (!payload?.applicationMethod) {
      throw new BadRequestException('applicationMethod is required');
    }

    try {
      return await this.promotions.create(storeId!, tenantId!, payload);
    } catch (err: any) {
      this.handleUniqueError(err, 'Promotion code already exists');
      throw err;
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: PromotionUpdatePayload,
  ) {
    this.requireContext(storeId, tenantId);

    if (payload?.code !== undefined && !payload.code?.trim()) {
      throw new BadRequestException('Code is required');
    }

    try {
      const promotion = await this.promotions.update(
        storeId!,
        tenantId!,
        id,
        payload,
      );
      if (!promotion) {
        throw new NotFoundException('Promotion not found');
      }
      return promotion;
    } catch (err: any) {
      this.handleUniqueError(err, 'Promotion code already exists');
      throw err;
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: PromotionStatusUpdatePayload,
  ) {
    this.requireContext(storeId, tenantId);

    const promotion = await this.promotions.updateStatus(
      storeId!,
      tenantId!,
      id,
      payload,
    );
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }
    return promotion;
  }

  @Put(':id/rules')
  async replaceRules(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: PromotionRulesReplacePayload,
  ) {
    this.requireContext(storeId, tenantId);
    const promotion = await this.promotions.replaceRules(
      storeId!,
      tenantId!,
      id,
      payload,
    );
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }
    return promotion;
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    const promotion = await this.promotions.delete(storeId!, tenantId!, id);
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }
    return promotion;
  }

  private requireContext(storeId?: string, tenantId?: string) {
    if (!storeId || !tenantId) {
      throw new UnauthorizedException();
    }
  }

  private parseNumber(value?: string): number | undefined {
    if (!value) return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  }

  private parseBoolean(value?: string): boolean | undefined {
    if (value === undefined || value === null) return undefined;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  }

  private handleUniqueError(err: any, message: string) {
    if (err?.code === 'P2002') {
      throw new ConflictException(message);
    }
  }
}
