import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  CampaignCreatePayload,
  CampaignUpdatePayload,
} from '@flex-erp/store/types';
import { CampaignsService } from './campaigns.service';

@UseGuards(AuthGuard('jwt'))
@Controller('store/campaigns')
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  async list(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('q') q?: string,
    @Query('isActive') isActive?: string,
  ) {
    this.requireContext(storeId, tenantId);

    return this.campaigns.list(storeId!, tenantId!, {
      limit: this.parseNumber(limit),
      offset: this.parseNumber(offset),
      q: q?.trim() || null,
      isActive: this.parseBoolean(isActive),
    });
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    const campaign = await this.campaigns.getById(storeId!, tenantId!, id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  @Post()
  async create(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: CampaignCreatePayload,
  ) {
    this.requireContext(storeId, tenantId);
    if (!payload?.name?.trim()) {
      throw new BadRequestException('Name is required');
    }
    if (!payload?.budget) {
      throw new BadRequestException('budget is required');
    }

    return this.campaigns.create(storeId!, tenantId!, payload);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: CampaignUpdatePayload,
  ) {
    this.requireContext(storeId, tenantId);
    if (payload?.name !== undefined && !payload.name?.trim()) {
      throw new BadRequestException('Name is required');
    }
    const campaign = await this.campaigns.update(storeId!, tenantId!, id, payload);
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  @Post(':id/promotions/:promotionId')
  async attachPromotion(
    @Param('id') id: string,
    @Param('promotionId') promotionId: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    const campaign = await this.campaigns.attachPromotion(
      storeId!,
      tenantId!,
      id,
      promotionId,
    );
    if (!campaign) {
      throw new NotFoundException('Campaign or promotion not found');
    }
    return campaign;
  }

  @Delete(':id/promotions/:promotionId')
  async detachPromotion(
    @Param('id') id: string,
    @Param('promotionId') promotionId: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    const campaign = await this.campaigns.detachPromotion(
      storeId!,
      tenantId!,
      id,
      promotionId,
    );
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
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
}
