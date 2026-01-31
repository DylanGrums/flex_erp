import {
  BadRequestException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import {
  CampaignSummary,
  CurrencyCode,
  PagedResult,
  PromotionApplicationMethodDto,
  PromotionApplicationMethodInput,
  PromotionCreatePayload,
  PromotionDetail,
  PromotionListItem,
  PromotionRuleDto,
  PromotionRuleInput,
  PromotionRuleOperator,
  PromotionRuleScope,
  PromotionStatus,
  PromotionStatusUpdatePayload,
  PromotionUpdatePayload,
  PromotionRulesReplacePayload,
  PromotionType,
} from '@flex-erp/store/types';

const MAX_PAGE_SIZE = 100;
const VALUE_MULTIPLIER = 100;

const PROMOTION_STATUS = new Set<PromotionStatus>([
  'DRAFT',
  'ACTIVE',
  'DISABLED',
]);

const PROMOTION_TYPES = new Set<PromotionType>(['STANDARD']);

const RULE_OPERATORS = new Set<PromotionRuleOperator>([
  'EQ',
  'NE',
  'IN',
  'NIN',
  'GT',
  'GTE',
  'LT',
  'LTE',
]);

const RULE_SCOPES = new Set<PromotionRuleScope>([
  'PROMOTION',
  'TARGET',
  'BUY',
]);

@Injectable()
export class PromotionsService implements OnModuleInit {
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
      status?: PromotionStatus | null;
      isActive?: boolean | null;
      campaignId?: string | null;
    },
  ): Promise<PagedResult<PromotionListItem>> {
    const limit = this.clampPageSize(params.limit ?? 20);
    const offset = Math.max(0, params.offset ?? 0);
    const where: any = { tenantId, storeId };

    if (params.q) {
      where.code = { contains: params.q.trim(), mode: 'insensitive' };
    }
    if (params.status) {
      where.status = params.status;
    }
    if (params.isActive !== null && params.isActive !== undefined) {
      where.isActive = params.isActive;
    }
    if (params.campaignId) {
      where.campaignLinks = {
        some: {
          tenantId,
          storeId,
          campaignId: params.campaignId,
        },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.promotion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: { campaignLinks: true },
      }),
      this.prisma.promotion.count({ where }),
    ]);

    return {
      items: items.map((promotion) => this.toPromotionListItem(promotion)),
      total,
      limit,
      offset,
    };
  }

  async getById(
    storeId: string,
    tenantId: string,
    id: string,
  ): Promise<PromotionDetail | null> {
    const promotion = await this.prisma.promotion.findFirst({
      where: { id, storeId, tenantId },
      include: {
        rules: { orderBy: { createdAt: 'asc' } },
        applicationMethod: true,
        campaignLinks: { include: { campaign: true } },
      },
    });

    if (!promotion) return null;
    return this.toPromotionDetail(promotion);
  }

  async create(
    storeId: string,
    tenantId: string,
    payload: PromotionCreatePayload,
  ): Promise<PromotionDetail> {
    const normalized = this.normalizePromotionPayload(payload);
    this.validatePromotionPayload(normalized, true);

    return this.prisma.$transaction(async (tx) => {
      const promotion = await tx.promotion.create({
        data: {
          tenantId,
          storeId,
          code: normalized.code,
          type: normalized.type,
          status: normalized.status,
          isAutomatic: normalized.isAutomatic,
          startsAt: normalized.startsAt,
          endsAt: normalized.endsAt,
          isActive: normalized.isActive,
          usageLimit: normalized.usageLimit,
          metadata: normalized.metadata ?? undefined,
        },
      });

      const rules = this.buildRulesData(promotion.id, tenantId, storeId, normalized);
      if (rules.length) {
        await tx.promotionRule.createMany({ data: rules });
      }

      if (normalized.applicationMethod) {
        await tx.promotionApplicationMethod.create({
          data: this.buildApplicationMethodData(
            promotion.id,
            tenantId,
            storeId,
            normalized.applicationMethod,
          ),
        });
      }

      if (normalized.campaignId) {
        const campaign = await tx.campaign.findFirst({
          where: { id: normalized.campaignId, tenantId, storeId },
        });
        if (!campaign) {
          throw new BadRequestException('Campaign not found');
        }
        await tx.campaignPromotion.create({
          data: {
            tenantId,
            storeId,
            campaignId: normalized.campaignId,
            promotionId: promotion.id,
          },
        });
      }

      const created = await tx.promotion.findFirst({
        where: { id: promotion.id, tenantId, storeId },
        include: {
          rules: { orderBy: { createdAt: 'asc' } },
          applicationMethod: true,
          campaignLinks: { include: { campaign: true } },
        },
      });

      if (!created) {
        throw new BadRequestException('Promotion not created');
      }
      return this.toPromotionDetail(created);
    });
  }

  async update(
    storeId: string,
    tenantId: string,
    id: string,
    payload: PromotionUpdatePayload,
  ): Promise<PromotionDetail | null> {
    const normalized = this.normalizePromotionPayload(payload);
    this.validatePromotionPayload(normalized, false);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.promotion.findFirst({
        where: { id, tenantId, storeId },
      });
      if (!existing) return null;

      await tx.promotion.update({
        where: { id },
        data: {
          code: normalized.code ?? existing.code,
          type: normalized.type ?? existing.type,
          status: normalized.status ?? existing.status,
          isAutomatic: normalized.isAutomatic ?? existing.isAutomatic,
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
          usageLimit:
            normalized.usageLimit !== undefined
              ? normalized.usageLimit
              : existing.usageLimit,
          metadata:
            normalized.metadata !== undefined
              ? normalized.metadata
              : existing.metadata,
        },
      });

      if (normalized.applicationMethod) {
        await tx.promotionApplicationMethod.upsert({
          where: {
            tenantId_storeId_promotionId: {
              tenantId,
              storeId,
              promotionId: id,
            },
          },
          update: this.buildApplicationMethodData(
            id,
            tenantId,
            storeId,
            normalized.applicationMethod,
          ),
          create: this.buildApplicationMethodData(
            id,
            tenantId,
            storeId,
            normalized.applicationMethod,
          ),
        });
      }

      const updated = await tx.promotion.findFirst({
        where: { id, tenantId, storeId },
        include: {
          rules: { orderBy: { createdAt: 'asc' } },
          applicationMethod: true,
          campaignLinks: { include: { campaign: true } },
        },
      });

      if (!updated) return null;
      return this.toPromotionDetail(updated);
    });
  }

  async updateStatus(
    storeId: string,
    tenantId: string,
    id: string,
    payload: PromotionStatusUpdatePayload,
  ): Promise<PromotionDetail | null> {
    if (!payload?.status || !PROMOTION_STATUS.has(payload.status)) {
      throw new BadRequestException('Invalid status');
    }

    const existing = await this.prisma.promotion.findFirst({
      where: { id, tenantId, storeId },
    });
    if (!existing) return null;

    await this.prisma.promotion.update({
      where: { id },
      data: {
        status: payload.status,
        isActive:
          payload.isActive !== undefined ? payload.isActive : undefined,
      },
    });

    return this.getById(storeId, tenantId, id);
  }

  async replaceRules(
    storeId: string,
    tenantId: string,
    id: string,
    payload: PromotionRulesReplacePayload,
  ): Promise<PromotionDetail | null> {
    const normalized: PromotionRulesReplacePayload = {
      rules: payload?.rules ?? [],
      targetRules: payload?.targetRules ?? [],
      buyRules: payload?.buyRules ?? [],
    };

    this.validateRules(normalized.rules ?? [], 'PROMOTION');
    this.validateRules(normalized.targetRules ?? [], 'TARGET');
    this.validateRules(normalized.buyRules ?? [], 'BUY');

    return this.prisma.$transaction(async (tx) => {
      const promotion = await tx.promotion.findFirst({
        where: { id, tenantId, storeId },
      });
      if (!promotion) return null;

      await tx.promotionRule.deleteMany({
        where: { tenantId, storeId, promotionId: id },
      });

      const rules = this.buildRulesData(id, tenantId, storeId, normalized);
      if (rules.length) {
        await tx.promotionRule.createMany({ data: rules });
      }

      const updated = await tx.promotion.findFirst({
        where: { id, tenantId, storeId },
        include: {
          rules: { orderBy: { createdAt: 'asc' } },
          applicationMethod: true,
          campaignLinks: { include: { campaign: true } },
        },
      });

      if (!updated) return null;
      return this.toPromotionDetail(updated);
    });
  }

  async delete(
    storeId: string,
    tenantId: string,
    id: string,
  ): Promise<PromotionDetail | null> {
    const existing = await this.prisma.promotion.findFirst({
      where: { id, tenantId, storeId },
      include: {
        rules: { orderBy: { createdAt: 'asc' } },
        applicationMethod: true,
        campaignLinks: { include: { campaign: true } },
      },
    });
    if (!existing) return null;

    await this.prisma.promotion.delete({ where: { id } });
    return this.toPromotionDetail(existing);
  }

  async recomputeCartPromotions(
    storeId: string,
    tenantId: string,
    cartId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({
        where: { id: cartId, tenantId, storeId },
        include: {
          items: { include: { variant: true } },
          adjustments: true,
          promotionAdjustments: true,
        },
      });
      if (!cart) return null;

      const promotions = await tx.promotion.findMany({
        where: {
          tenantId,
          storeId,
          isActive: true,
          status: 'ACTIVE',
          isAutomatic: true,
        },
        include: {
          rules: true,
          applicationMethod: true,
        },
      });

      await tx.cartPromotionAdjustment.deleteMany({
        where: { tenantId, storeId, cartId },
      });

      const subtotalAmount = cart.items.reduce(
        (sum, item) => sum + (item.totalAmount ?? 0),
        0,
      );

      const adjustments = promotions
        .map((promotion) =>
          this.computePromotionAdjustment(promotion, cart, subtotalAmount),
        )
        .filter((adj) => adj && adj.amount > 0) as Array<{
        promotionId: string;
        amount: number;
        description: string;
      }>;

      if (adjustments.length) {
        await tx.cartPromotionAdjustment.createMany({
          data: adjustments.map((adj) => ({
            tenantId,
            storeId,
            cartId,
            promotionId: adj.promotionId,
            amount: adj.amount,
            description: adj.description,
          })),
        });
      }

      const discountAmount =
        cart.adjustments.reduce((sum, adj) => sum + (adj.amount ?? 0), 0) +
        adjustments.reduce((sum, adj) => sum + adj.amount, 0);

      const totalAmount = Math.max(subtotalAmount - discountAmount, 0);

      await tx.cart.update({
        where: { id: cart.id },
        data: {
          subtotalAmount,
          discountAmount,
          totalAmount,
        },
      });

      return {
        cartId: cart.id,
        subtotalAmount,
        discountAmount,
        totalAmount,
        appliedPromotions: adjustments,
      };
    });
  }

  isStatusSupported(status: string): status is PromotionStatus {
    return PROMOTION_STATUS.has(status as PromotionStatus);
  }

  isTypeSupported(type: string): type is PromotionType {
    return PROMOTION_TYPES.has(type as PromotionType);
  }

  private clampPageSize(value: number) {
    if (!Number.isFinite(value)) return 20;
    return Math.max(1, Math.min(MAX_PAGE_SIZE, Math.floor(value)));
  }

  private normalizePromotionPayload<T extends PromotionUpdatePayload>(payload: T) {
    const code = payload.code?.trim();
    const type = payload.type?.toUpperCase() as PromotionType | undefined;
    const status = payload.status?.toUpperCase() as PromotionStatus | undefined;
    const isAutomatic = payload.isAutomatic;
    const startsAt = this.parseDate(payload.startsAt ?? undefined);
    const endsAt = this.parseDate(payload.endsAt ?? undefined);
    const isActive = payload.isActive;
    const usageLimit = payload.usageLimit ?? undefined;

    const applicationMethod = payload.applicationMethod
      ? this.normalizeApplicationMethod(payload.applicationMethod)
      : undefined;

    const rules = payload.rules ?? undefined;
    const targetRules = payload.targetRules ?? undefined;
    const buyRules = payload.buyRules ?? undefined;

    return {
      ...payload,
      code: code ? this.normalizeCode(code) : undefined,
      type,
      status,
      isAutomatic,
      startsAt,
      endsAt,
      isActive,
      usageLimit,
      applicationMethod,
      rules,
      targetRules,
      buyRules,
    } as T;
  }

  private normalizeApplicationMethod(input: PromotionApplicationMethodInput) {
    return {
      ...input,
      type: input.type?.toUpperCase(),
      allocation: input.allocation?.toUpperCase(),
      targetType: input.targetType?.toUpperCase(),
      currency: input.currency?.toUpperCase() as CurrencyCode | undefined,
      maxQuantity:
        input.maxQuantity !== undefined ? Math.max(1, input.maxQuantity) : 1,
      isTaxInclusive: Boolean(input.isTaxInclusive),
    } as PromotionApplicationMethodInput;
  }

  private validatePromotionPayload(
    payload: PromotionUpdatePayload,
    requireApplicationMethod: boolean,
  ) {
    if (payload.code !== undefined && !payload.code?.trim()) {
      throw new BadRequestException('Code is required');
    }
    if (payload.type && !PROMOTION_TYPES.has(payload.type)) {
      throw new BadRequestException('Invalid promotion type');
    }
    if (payload.status && !PROMOTION_STATUS.has(payload.status)) {
      throw new BadRequestException('Invalid promotion status');
    }
    if (payload.startsAt && payload.endsAt && payload.startsAt > payload.endsAt) {
      throw new BadRequestException('startsAt must be before endsAt');
    }
    if (payload.usageLimit !== undefined && payload.usageLimit !== null) {
      if (!Number.isFinite(payload.usageLimit) || payload.usageLimit < 1) {
        throw new BadRequestException('usageLimit must be a positive number');
      }
    }

    if (requireApplicationMethod && !payload.applicationMethod) {
      throw new BadRequestException('applicationMethod is required');
    }

    if (payload.applicationMethod) {
      this.validateApplicationMethod(payload.applicationMethod);
    }

    if (payload.rules) {
      this.validateRules(payload.rules, 'PROMOTION');
    }
    if (payload.targetRules) {
      this.validateRules(payload.targetRules, 'TARGET');
    }
    if (payload.buyRules) {
      this.validateRules(payload.buyRules, 'BUY');
    }
  }

  private validateApplicationMethod(method: PromotionApplicationMethodInput) {
    if (!method?.type) {
      throw new BadRequestException('applicationMethod.type is required');
    }
    if (!method?.allocation) {
      throw new BadRequestException('applicationMethod.allocation is required');
    }
    if (!method?.targetType) {
      throw new BadRequestException('applicationMethod.targetType is required');
    }

    const type = method.type.toUpperCase();
    if (type !== 'FIXED' && type !== 'PERCENT') {
      throw new BadRequestException('applicationMethod.type is invalid');
    }

    const allocation = method.allocation.toUpperCase();
    if (allocation !== 'EACH' && allocation !== 'ACROSS') {
      throw new BadRequestException('applicationMethod.allocation is invalid');
    }

    const targetType = method.targetType.toUpperCase();
    if (targetType !== 'ITEMS') {
      throw new BadRequestException('applicationMethod.targetType is invalid');
    }

    if (!Number.isFinite(method.value)) {
      throw new BadRequestException('applicationMethod.value is required');
    }

    if (type === 'FIXED') {
      if (method.value < 0) {
        throw new BadRequestException('applicationMethod.value must be positive');
      }
    } else {
      if (method.value < 0 || method.value > 100) {
        throw new BadRequestException('applicationMethod.value must be between 0 and 100');
      }
    }
  }

  private validateRules(rules: PromotionRuleInput[], scope: PromotionRuleScope) {
    if (!Array.isArray(rules)) return;
    if (!RULE_SCOPES.has(scope)) {
      throw new BadRequestException('Invalid rule scope');
    }

    for (const rule of rules) {
      if (!rule?.attribute?.trim()) {
        throw new BadRequestException('Rule attribute is required');
      }
      if (!rule?.operator || !RULE_OPERATORS.has(rule.operator)) {
        throw new BadRequestException('Rule operator is invalid');
      }
      if (rule.values === undefined || rule.values === null) {
        throw new BadRequestException('Rule values are required');
      }
    }
  }

  private normalizeCode(code: string) {
    return code.trim().toUpperCase();
  }

  private parseDate(value?: string | Date | null): Date | null | undefined {
    if (value === null) return null;
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  private buildRulesData(
    promotionId: string,
    tenantId: string,
    storeId: string,
    payload: PromotionUpdatePayload | PromotionRulesReplacePayload,
  ) {
    const rules: Array<{
      tenantId: string;
      storeId: string;
      promotionId: string;
      scope: PromotionRuleScope;
      operator: PromotionRuleOperator;
      attribute: string;
      values: any;
    }> = [];

    const pushRules = (scope: PromotionRuleScope, list?: PromotionRuleInput[]) => {
      if (!list?.length) return;
      for (const rule of list) {
        rules.push({
          tenantId,
          storeId,
          promotionId,
          scope,
          operator: rule.operator,
          attribute: rule.attribute.trim(),
          values: rule.values,
        });
      }
    };

    pushRules('PROMOTION', payload.rules ?? []);
    pushRules('TARGET', payload.targetRules ?? []);
    pushRules('BUY', payload.buyRules ?? []);

    return rules;
  }

  private buildApplicationMethodData(
    promotionId: string,
    tenantId: string,
    storeId: string,
    method: PromotionApplicationMethodInput,
  ) {
    const type = method.type.toUpperCase();
    const allocation = method.allocation.toUpperCase();
    const targetType = method.targetType.toUpperCase();

    const valueAmount =
      type === 'FIXED' ? Math.round(method.value * VALUE_MULTIPLIER) : null;
    const valueBps = type === 'PERCENT' ? Math.round(method.value * 100) : null;

    return {
      tenantId,
      storeId,
      promotionId,
      type,
      allocation,
      targetType,
      valueAmount,
      valueBps,
      currency: (method.currency ?? 'EUR').toUpperCase(),
      maxQuantity: Math.max(1, method.maxQuantity ?? 1),
      isTaxInclusive: Boolean(method.isTaxInclusive),
    };
  }

  private toPromotionListItem(promotion: any): PromotionListItem {
    return {
      id: promotion.id,
      code: promotion.code,
      type: promotion.type,
      status: promotion.status,
      isAutomatic: promotion.isAutomatic,
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      isActive: promotion.isActive,
      usageLimit: promotion.usageLimit ?? null,
      campaignIds: promotion.campaignLinks?.map((link: any) => link.campaignId) ?? [],
      createdAt: promotion.createdAt,
      updatedAt: promotion.updatedAt,
    };
  }

  private toPromotionDetail(promotion: any): PromotionDetail {
    const rules = promotion.rules?.map((rule: any) => this.toRuleDto(rule)) ?? [];
    const campaigns: CampaignSummary[] =
      promotion.campaignLinks?.map((link: any) => ({
        id: link.campaign?.id ?? link.campaignId,
        name: link.campaign?.name ?? 'Campaign',
      })) ?? [];

    return {
      ...this.toPromotionListItem(promotion),
      rules,
      targetRules: rules.filter((rule) => rule.scope === 'TARGET'),
      buyRules: rules.filter((rule) => rule.scope === 'BUY'),
      applicationMethod: this.toApplicationMethodDto(promotion.applicationMethod),
      campaigns,
    };
  }

  private toRuleDto(rule: any): PromotionRuleDto {
    return {
      id: rule.id,
      scope: rule.scope,
      operator: rule.operator,
      attribute: rule.attribute,
      values: rule.values,
    };
  }

  private toApplicationMethodDto(method: any): PromotionApplicationMethodDto | null {
    if (!method) return null;
    const value =
      method.type === 'FIXED'
        ? (method.valueAmount ?? 0) / VALUE_MULTIPLIER
        : (method.valueBps ?? 0) / 100;

    return {
      type: method.type,
      allocation: method.allocation,
      targetType: method.targetType,
      value,
      valueAmount: method.valueAmount ?? null,
      valueBps: method.valueBps ?? null,
      currency: method.currency,
      maxQuantity: method.maxQuantity ?? 1,
      isTaxInclusive: method.isTaxInclusive ?? false,
    };
  }

  private computePromotionAdjustment(
    promotion: any,
    cart: any,
    subtotalAmount: number,
  ) {
    if (!promotion.applicationMethod) return null;

    if (!this.matchesPromotionRules(promotion.rules ?? [], cart, subtotalAmount)) {
      return null;
    }

    const eligibleItems = this.filterEligibleItems(
      cart.items ?? [],
      promotion.rules ?? [],
    );

    if (!eligibleItems.length) return null;

    const method = promotion.applicationMethod;
    const allocation = method.allocation;
    const type = method.type;
    const maxQuantity = Math.max(1, method.maxQuantity ?? 1);

    if (type === 'FIXED') {
      const unitValue = method.valueAmount ?? 0;
      let amount = 0;

      if (allocation === 'EACH') {
        for (const item of eligibleItems) {
          const qty = Math.min(item.quantity ?? 0, maxQuantity);
          amount += unitValue * qty;
        }
      } else {
        amount = unitValue;
      }

      amount = Math.min(amount, subtotalAmount);
      return amount > 0
        ? {
            promotionId: promotion.id,
            amount,
            description: `Promotion ${promotion.code}`,
          }
        : null;
    }

    const percent = (method.valueBps ?? 0) / 10000;
    const eligibleAmount = eligibleItems.reduce(
      (sum, item) => sum + (item.totalAmount ?? 0),
      0,
    );
    const amount = Math.round(eligibleAmount * percent);
    return amount > 0
      ? {
          promotionId: promotion.id,
          amount,
          description: `Promotion ${promotion.code}`,
        }
      : null;
  }

  private matchesPromotionRules(
    rules: any[],
    cart: any,
    subtotalAmount: number,
  ) {
    const scoped = rules.filter((rule) => rule.scope === 'PROMOTION');
    if (!scoped.length) return true;

    return scoped.every((rule) => {
      const value = this.extractCartAttribute(cart, subtotalAmount, rule.attribute);
      return this.evaluateRule(rule.operator, value, rule.values);
    });
  }

  private filterEligibleItems(items: any[], rules: any[]) {
    const scoped = rules.filter((rule) => rule.scope === 'TARGET');
    if (!scoped.length) return items;

    return items.filter((item) =>
      scoped.every((rule) => {
        const value = this.extractItemAttribute(item, rule.attribute);
        return this.evaluateRule(rule.operator, value, rule.values);
      }),
    );
  }

  private extractCartAttribute(cart: any, subtotalAmount: number, attribute: string) {
    switch (attribute) {
      case 'currency_code':
      case 'currency':
        return cart.currency;
      case 'subtotal_amount':
        return subtotalAmount;
      case 'item_count':
        return Array.isArray(cart.items) ? cart.items.length : 0;
      default:
        return undefined;
    }
  }

  private extractItemAttribute(item: any, attribute: string) {
    switch (attribute) {
      case 'variant_id':
      case 'variantId':
        return item.variantId ?? item.variant?.id;
      case 'product_id':
      case 'productId':
        return item.variant?.productId;
      case 'sku':
        return item.variant?.sku;
      case 'price_amount':
        return item.unitPriceAmount ?? item.totalAmount;
      case 'quantity':
        return item.quantity;
      default:
        return undefined;
    }
  }

  private evaluateRule(operator: PromotionRuleOperator, value: any, ruleValues: any) {
    if (value === undefined || value === null) {
      return false;
    }
    const values = Array.isArray(ruleValues) ? ruleValues : [ruleValues];
    switch (operator) {
      case 'EQ':
        return value === values[0];
      case 'NE':
        return value !== values[0];
      case 'IN':
        return values.includes(value);
      case 'NIN':
        return !values.includes(value);
      case 'GT':
        return Number(value) > Number(values[0]);
      case 'GTE':
        return Number(value) >= Number(values[0]);
      case 'LT':
        return Number(value) < Number(values[0]);
      case 'LTE':
        return Number(value) <= Number(values[0]);
      default:
        return false;
    }
  }
}
