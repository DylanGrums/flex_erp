import { TestBed } from '@angular/core/testing';
import { StateContext } from '@ngxs/store';
import { PromotionsState } from './promotions.state';
import { PromotionsStateModel } from './promotions.models';
import { PromotionsApi } from './promotions.api';
import { LoadPromotionsSuccess, CreatePromotionSuccess } from './promotions.actions';
import { PromotionDetail } from '@flex-erp/store/util';

type TestContext = StateContext<PromotionsStateModel> & { dispatch: jest.Mock };

const DEFAULT_STATE: PromotionsStateModel = {
  items: [],
  total: 0,
  limit: 20,
  offset: 0,
  selectedId: null,
  selectedDetail: null,
  listLoading: false,
  detailLoading: false,
  mutationLoading: false,
  rulesLoading: false,
  errors: { list: null, detail: null, mutation: null, rules: null },
};

const createContext = (
  override: Partial<PromotionsStateModel> = {},
): { ctx: TestContext; latest: () => PromotionsStateModel } => {
  let current: PromotionsStateModel = {
    ...DEFAULT_STATE,
    ...override,
    errors: { ...DEFAULT_STATE.errors, ...(override.errors ?? {}) },
  };

  const ctx: TestContext = {
    getState: () => current,
    setState: (val: any) => {
      current = typeof val === 'function' ? val(current) : val;
    },
    patchState: (val: Partial<PromotionsStateModel>) => {
      current = { ...current, ...val, errors: { ...current.errors, ...(val.errors ?? {}) } };
    },
    dispatch: jest.fn(),
    abortSignal: undefined as any,
  };

  return { ctx, latest: () => current };
};

describe('PromotionsState', () => {
  let state: PromotionsState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PromotionsState,
        { provide: PromotionsApi, useValue: {} },
      ],
    });

    state = TestBed.inject(PromotionsState);
  });

  it('updates list state on LoadPromotionsSuccess', () => {
    const { ctx, latest } = createContext();

    state.loadPromotionsSuccess(
      ctx,
      new LoadPromotionsSuccess({
        items: [
          {
            id: 'p1',
            code: 'SAVE10',
            type: 'STANDARD',
            status: 'ACTIVE',
            isAutomatic: false,
            startsAt: null,
            endsAt: null,
            isActive: true,
            usageLimit: null,
            campaignIds: [],
            createdAt: null,
            updatedAt: null,
          },
        ],
        total: 1,
        limit: 10,
        offset: 0,
      }),
    );

    expect(latest().items.length).toBe(1);
    expect(latest().total).toBe(1);
    expect(latest().limit).toBe(10);
  });

  it('sets selected detail on CreatePromotionSuccess', () => {
    const { ctx, latest } = createContext();
    const promotion: PromotionDetail = {
      id: 'p1',
      code: 'SAVE10',
      type: 'STANDARD',
      status: 'ACTIVE',
      isAutomatic: false,
      startsAt: null,
      endsAt: null,
      isActive: true,
      usageLimit: null,
      campaignIds: [],
      createdAt: null,
      updatedAt: null,
      rules: [],
      targetRules: [],
      buyRules: [],
      applicationMethod: null,
      campaigns: [],
    };

    state.createPromotionSuccess(ctx, new CreatePromotionSuccess(promotion));

    expect(latest().selectedId).toBe('p1');
    expect(latest().selectedDetail?.code).toBe('SAVE10');
  });
});
