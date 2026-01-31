import { PromotionsService } from './promotions.service';
import { PromotionCreatePayload, PromotionRulesReplacePayload } from '@flex-erp/store/types';

describe('PromotionsService', () => {
  let service: PromotionsService;
  let prisma: any;
  let tx: any;

  beforeEach(() => {
    tx = {
      promotion: {
        create: jest.fn(),
        findFirst: jest.fn(),
      },
      campaign: {
        findFirst: jest.fn(),
      },
      promotionRule: {
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      promotionApplicationMethod: {
        create: jest.fn(),
        upsert: jest.fn(),
      },
      campaignPromotion: {
        create: jest.fn(),
      },
    };

    prisma = {
      $transaction: jest.fn(async (cb: any) => cb(tx)),
      promotion: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    service = new PromotionsService();
    (service as any).prisma = prisma;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates promotion with rules and application method', async () => {
    const payload: PromotionCreatePayload = {
      code: 'SAVE10',
      status: 'ACTIVE',
      isAutomatic: false,
      isActive: true,
      applicationMethod: {
        type: 'FIXED',
        allocation: 'EACH',
        targetType: 'ITEMS',
        value: 10,
        currency: 'EUR',
        maxQuantity: 2,
        isTaxInclusive: false,
      },
      rules: [{ attribute: 'currency_code', operator: 'EQ', values: 'EUR' }],
      targetRules: [{ attribute: 'product_id', operator: 'IN', values: ['p1'] }],
      campaignId: 'c1',
    };

    tx.promotion.create.mockResolvedValue({ id: 'promo-1' });
    tx.campaign.findFirst.mockResolvedValue({ id: 'c1' });
    tx.promotion.findFirst.mockResolvedValue({
      id: 'promo-1',
      code: 'SAVE10',
      type: 'STANDARD',
      status: 'ACTIVE',
      isAutomatic: false,
      startsAt: null,
      endsAt: null,
      isActive: true,
      usageLimit: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      rules: [
        {
          id: 'rule-1',
          scope: 'PROMOTION',
          operator: 'EQ',
          attribute: 'currency_code',
          values: 'EUR',
        },
      ],
      applicationMethod: {
        type: 'FIXED',
        allocation: 'EACH',
        targetType: 'ITEMS',
        valueAmount: 1000,
        valueBps: null,
        currency: 'EUR',
        maxQuantity: 2,
        isTaxInclusive: false,
      },
      campaignLinks: [],
    });

    const result = await service.create('store-1', 'tenant-1', payload);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(tx.promotion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: 'SAVE10' }),
      }),
    );
    expect(tx.promotionRule.createMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array) }),
    );
    expect(tx.promotionApplicationMethod.create).toHaveBeenCalled();
    expect(result.code).toBe('SAVE10');
  });

  it('replaces rules by deleting and recreating', async () => {
    const payload: PromotionRulesReplacePayload = {
      rules: [{ attribute: 'currency_code', operator: 'EQ', values: 'EUR' }],
      targetRules: [{ attribute: 'product_id', operator: 'IN', values: ['p1'] }],
    };

    tx.promotion.findFirst.mockResolvedValue({ id: 'promo-1' });
    tx.promotion.findFirst.mockResolvedValueOnce({ id: 'promo-1' });
    tx.promotion.findFirst.mockResolvedValueOnce({
      id: 'promo-1',
      code: 'SAVE10',
      type: 'STANDARD',
      status: 'ACTIVE',
      isAutomatic: false,
      startsAt: null,
      endsAt: null,
      isActive: true,
      usageLimit: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      rules: [],
      applicationMethod: null,
      campaignLinks: [],
    });

    const result = await service.replaceRules('store-1', 'tenant-1', 'promo-1', payload);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(tx.promotionRule.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ promotionId: 'promo-1' }) }),
    );
    expect(tx.promotionRule.createMany).toHaveBeenCalled();
    expect(result?.id).toBe('promo-1');
  });

  it('applies list filters', async () => {
    prisma.promotion.findMany.mockResolvedValue([]);
    prisma.promotion.count.mockResolvedValue(0);

    await service.list('store-1', 'tenant-1', {
      limit: 10,
      offset: 0,
      q: 'save',
      status: 'ACTIVE',
      isActive: true,
      campaignId: 'camp-1',
    });

    const args = prisma.promotion.findMany.mock.calls[0][0];
    expect(args.where).toMatchObject({
      tenantId: 'tenant-1',
      storeId: 'store-1',
      status: 'ACTIVE',
      isActive: true,
      code: { contains: 'save', mode: 'insensitive' },
    });
    expect(args.where.campaignLinks).toBeDefined();
  });

  it('wraps create in a transaction (integration-ish)', async () => {
    const payload: PromotionCreatePayload = {
      code: 'SPRING',
      status: 'DRAFT',
      isAutomatic: false,
      isActive: true,
      applicationMethod: {
        type: 'PERCENT',
        allocation: 'EACH',
        targetType: 'ITEMS',
        value: 10,
        currency: 'EUR',
        maxQuantity: 1,
        isTaxInclusive: false,
      },
    };

    tx.promotion.create.mockResolvedValue({ id: 'promo-2' });
    tx.promotion.findFirst.mockResolvedValue({
      id: 'promo-2',
      code: 'SPRING',
      type: 'STANDARD',
      status: 'DRAFT',
      isAutomatic: false,
      startsAt: null,
      endsAt: null,
      isActive: true,
      usageLimit: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      rules: [],
      applicationMethod: null,
      campaignLinks: [],
    });

    await service.create('store-1', 'tenant-1', payload);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
