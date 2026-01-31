import {
  BadRequestException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import {
  CampaignBudgetInput,
  CampaignDetail,
  CampaignListItem,
  CampaignCreatePayload,
  CampaignUpdatePayload,
  PagedResult,
  PromotionListItem,
  PromotionStatus,
} from '@flex-erp/store/types';

const MAX_PAGE_SIZE = 100;

@Injectable()
export class CampaignsService implements OnModuleInit {
  private prisma = new (PrismaClient as any)({
    adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }),
  }) as PrismaClient;

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async list(
    storeId: string,
    tenantId: string,
    params: {
      limit?: number | null;
      offset?: number | null;
      q?: string | null;
      isActive?: boolean | null;
    },
  ): Promise<PagedResult<CampaignListItem>> {
    const limit = this.clampPageSize(params.limit ?? 20);
    const offset = Math.max(0, params.offset ?? 0);

    const where: any = { tenantId, storeId };

    if (params.q) {
      where.OR = [
        { name: { contains: params.q.trim(), mode: 'insensitive' } },
        { description: { contains: params.q.trim(), mode: 'insensitive' } },
      ];
    }
    if (params.isActive !== null && params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const [items, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      items: items.map((campaign) => this.toCampaignListItem(campaign)),
      total,
      limit,
      offset,
    };
  }

  async getById(
    storeId: string,
    tenantId: string,
    id: string,
  ): Promise<CampaignDetail | null> {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, tenantId, storeId },
      include: {
        promotions: {
          include: {
            promotion: true,
          },
        },
      },
    });

    if (!campaign) return null;

    const promotions: PromotionListItem[] =
      campaign.promotions?.map((link: any) =>
        this.toPromotionListItem(link.promotion),
      ) ?? [];

    return {
      ...this.toCampaignListItem(campaign),
      promotions,
    };
  }

  async create(
    storeId: string,
    tenantId: string,
    payload: CampaignCreatePayload,
  ): Promise<CampaignDetail> {
    const normalized = this.normalizeCampaignPayload(payload);
    this.validateCampaignPayload(normalized, true);

    const campaign = await this.prisma.campaign.create({
      data: {
        tenantId,
        storeId,
        name: normalized.name,
        description: normalized.description ?? null,
        startsAt: normalized.startsAt,
        endsAt: normalized.endsAt,
        isActive: normalized.isActive ?? true,
        budgetType: normalized.budget.type,
        budgetLimitAmount: normalized.budget.limitAmount ?? null,
        budgetCurrency: normalized.budget.currency ?? 'EUR',
        budgetAttribute: normalized.budget.attribute ?? null,
      },
    });

    const detail = await this.getById(storeId, tenantId, campaign.id);
    if (!detail) {
      throw new BadRequestException('Campaign not created');
    }
    return detail;
  }

  async update(
    storeId: string,
    tenantId: string,
    id: string,
    payload: CampaignUpdatePayload,
  ): Promise<CampaignDetail | null> {
    const normalized = this.normalizeCampaignPayload(payload);
    this.validateCampaignPayload(normalized, false);

    const existing = await this.prisma.campaign.findFirst({
      where: { id, tenantId, storeId },
    });
    if (!existing) return null;

    const budget = normalized.budget
      ? {
          budgetType: normalized.budget.type,
          budgetLimitAmount: normalized.budget.limitAmount ?? null,
          budgetCurrency: normalized.budget.currency ?? existing.budgetCurrency,
          budgetAttribute: normalized.budget.attribute ?? null,
        }
      : {};

    await this.prisma.campaign.update({
      where: { id },
      data: {
        name: normalized.name ?? existing.name,
        description:
          normalized.description !== undefined
            ? normalized.description
            : existing.description,
        startsAt:
          normalized.startsAt !== undefined
            ? normalized.startsAt
            : existing.startsAt,
        endsAt:
          normalized.endsAt !== undefined
            ? normalized.endsAt
            : existing.endsAt,
        isActive:
          normalized.isActive !== undefined
            ? normalized.isActive
            : existing.isActive,
        ...budget,
      },
    });

    return this.getById(storeId, tenantId, id);
  }

  async attachPromotion(
    storeId: string,
    tenantId: string,
    campaignId: string,
    promotionId: string,
  ): Promise<CampaignDetail | null> {
    const [campaign, promotion] = await Promise.all([
      this.prisma.campaign.findFirst({
        where: { id: campaignId, tenantId, storeId },
      }),
      this.prisma.promotion.findFirst({
        where: { id: promotionId, tenantId, storeId },
      }),
    ]);

    if (!campaign || !promotion) return null;

    await this.prisma.campaignPromotion.upsert({
      where: {
        tenantId_storeId_campaignId_promotionId: {
          tenantId,
          storeId,
          campaignId,
          promotionId,
        },
      },
      update: {},
      create: {
        tenantId,
        storeId,
        campaignId,
        promotionId,
      },
    });

    return this.getById(storeId, tenantId, campaignId);
  }

  async detachPromotion(
    storeId: string,
    tenantId: string,
    campaignId: string,
    promotionId: string,
  ): Promise<CampaignDetail | null> {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, tenantId, storeId },
    });
    if (!campaign) return null;

    await this.prisma.campaignPromotion.deleteMany({
      where: {
        tenantId,
        storeId,
        campaignId,
        promotionId,
      },
    });

    return this.getById(storeId, tenantId, campaignId);
  }

  private clampPageSize(value: number) {
    if (!Number.isFinite(value)) return 20;
    return Math.max(1, Math.min(MAX_PAGE_SIZE, Math.floor(value)));
  }

  private normalizeCampaignPayload<T extends CampaignUpdatePayload>(payload: T) {
    const name = payload.name?.trim();
    const description =
      payload.description !== undefined
        ? payload.description?.trim() || null
        : undefined;
    const startsAt = this.parseDate(payload.startsAt ?? undefined);
    const endsAt = this.parseDate(payload.endsAt ?? undefined);
    const isActive = payload.isActive;

    const budget = payload.budget
      ? this.normalizeBudget(payload.budget)
      : undefined;

    return {
      ...payload,
      name,
      description,
      startsAt,
      endsAt,
      isActive,
      budget,
    } as T;
  }

  private normalizeBudget(input: CampaignBudgetInput): CampaignBudgetInput {
    return {
      ...input,
      type: input.type?.toUpperCase(),
      currency: input.currency?.toUpperCase(),
      attribute: input.attribute?.trim() || null,
    } as CampaignBudgetInput;
  }

  private validateCampaignPayload(
    payload: CampaignUpdatePayload,
    requireBudget: boolean,
  ) {
    if (payload.name !== undefined && !payload.name?.trim()) {
      throw new BadRequestException('Name is required');
    }
    if (payload.startsAt && payload.endsAt && payload.startsAt > payload.endsAt) {
      throw new BadRequestException('startsAt must be before endsAt');
    }
    if (requireBudget && !payload.budget) {
      throw new BadRequestException('budget is required');
    }
    if (payload.budget) {
      if (!payload.budget.type) {
        throw new BadRequestException('budget.type is required');
      }
      if (
        payload.budget.type === 'USE_BY_ATTRIBUTE' &&
        !payload.budget.attribute
      ) {
        throw new BadRequestException('budget.attribute is required');
      }
      if (
        payload.budget.limitAmount !== undefined &&
        payload.budget.limitAmount !== null
      ) {
        if (
          !Number.isFinite(payload.budget.limitAmount) ||
          payload.budget.limitAmount < 0
        ) {
          throw new BadRequestException('budget.limitAmount must be valid');
        }
      }
    }
  }

  private parseDate(value?: string | Date | null): Date | null | undefined {
    if (value === null) return null;
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  private toCampaignListItem(campaign: any): CampaignListItem {
    return {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description ?? null,
      startsAt: campaign.startsAt,
      endsAt: campaign.endsAt,
      isActive: campaign.isActive,
      budget: {
        type: campaign.budgetType,
        limitAmount: campaign.budgetLimitAmount ?? null,
        currency: campaign.budgetCurrency,
        attribute: campaign.budgetAttribute ?? null,
      },
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }

  private toPromotionListItem(promotion: any): PromotionListItem {
    return {
      id: promotion.id,
      code: promotion.code,
      type: promotion.type,
      status: promotion.status as PromotionStatus,
      isAutomatic: promotion.isAutomatic,
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      isActive: promotion.isActive,
      usageLimit: promotion.usageLimit ?? null,
      campaignIds: [],
      createdAt: promotion.createdAt,
      updatedAt: promotion.updatedAt,
    };
  }
}
