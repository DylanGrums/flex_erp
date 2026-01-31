import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, of, tap } from 'rxjs';
import { PromotionDetail, PromotionListItem } from '@flex-erp/store/util';
import {
  CreatePromotion,
  CreatePromotionFailed,
  CreatePromotionSuccess,
  DeletePromotion,
  DeletePromotionFailed,
  DeletePromotionSuccess,
  LoadPromotion,
  LoadPromotionFailed,
  LoadPromotionSuccess,
  LoadPromotions,
  LoadPromotionsFailed,
  LoadPromotionsSuccess,
  ReplacePromotionRules,
  ReplacePromotionRulesFailed,
  ReplacePromotionRulesSuccess,
  SelectPromotion,
  UpdatePromotion,
  UpdatePromotionFailed,
  UpdatePromotionStatus,
  UpdatePromotionStatusFailed,
  UpdatePromotionStatusSuccess,
  UpdatePromotionSuccess,
} from './promotions.actions';
import { PromotionsApi } from './promotions.api';
import { PromotionsStateModel } from './promotions.models';

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
  errors: {
    list: null,
    detail: null,
    mutation: null,
    rules: null,
  },
};

@State<PromotionsStateModel>({
  name: 'storePromotions',
  defaults: DEFAULT_STATE,
})
@Injectable()
export class PromotionsState {
  private api = inject(PromotionsApi);

  @Selector()
  static items(state: PromotionsStateModel) {
    return state.items;
  }

  @Selector()
  static total(state: PromotionsStateModel) {
    return state.total;
  }

  @Selector()
  static limit(state: PromotionsStateModel) {
    return state.limit;
  }

  @Selector()
  static offset(state: PromotionsStateModel) {
    return state.offset;
  }

  @Selector()
  static selectedId(state: PromotionsStateModel) {
    return state.selectedId;
  }

  @Selector()
  static selectedDetail(state: PromotionsStateModel) {
    return state.selectedDetail;
  }

  @Selector()
  static listLoading(state: PromotionsStateModel) {
    return state.listLoading;
  }

  @Selector()
  static detailLoading(state: PromotionsStateModel) {
    return state.detailLoading;
  }

  @Selector()
  static mutationLoading(state: PromotionsStateModel) {
    return state.mutationLoading;
  }

  @Selector()
  static rulesLoading(state: PromotionsStateModel) {
    return state.rulesLoading;
  }

  @Selector()
  static errors(state: PromotionsStateModel) {
    return state.errors;
  }

  @Action(LoadPromotions)
  loadPromotions(ctx: StateContext<PromotionsStateModel>, action: LoadPromotions) {
    ctx.patchState({
      listLoading: true,
      errors: { ...ctx.getState().errors, list: null },
    });
    return this.api.list(action.params).pipe(
      tap((response) => {
        if (!response) {
          ctx.dispatch(new LoadPromotionsFailed('Failed to load promotions'));
          return;
        }
        ctx.dispatch(new LoadPromotionsSuccess(response));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to load promotions';
        ctx.dispatch(
          new LoadPromotionsFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(LoadPromotionsSuccess)
  loadPromotionsSuccess(
    ctx: StateContext<PromotionsStateModel>,
    action: LoadPromotionsSuccess,
  ) {
    ctx.patchState({
      items: action.response.items ?? [],
      total: action.response.total ?? 0,
      limit: action.response.limit ?? 20,
      offset: action.response.offset ?? 0,
      listLoading: false,
      errors: { ...ctx.getState().errors, list: null },
    });
  }

  @Action(LoadPromotionsFailed)
  loadPromotionsFailed(
    ctx: StateContext<PromotionsStateModel>,
    action: LoadPromotionsFailed,
  ) {
    ctx.patchState({
      listLoading: false,
      errors: { ...ctx.getState().errors, list: action.error },
    });
  }

  @Action(LoadPromotion)
  loadPromotion(ctx: StateContext<PromotionsStateModel>, action: LoadPromotion) {
    ctx.patchState({
      detailLoading: true,
      selectedId: action.promotionId,
      errors: { ...ctx.getState().errors, detail: null },
    });
    return this.api.getById(action.promotionId).pipe(
      tap((promotion) => {
        if (!promotion) {
          ctx.dispatch(new LoadPromotionFailed('Promotion not found'));
          return;
        }
        ctx.dispatch(new LoadPromotionSuccess(promotion));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to load promotion';
        ctx.dispatch(
          new LoadPromotionFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(LoadPromotionSuccess)
  loadPromotionSuccess(
    ctx: StateContext<PromotionsStateModel>,
    action: LoadPromotionSuccess,
  ) {
    const state = ctx.getState();
    const nextItems = this.upsertListItem(state.items, action.promotion);
    ctx.patchState({
      items: nextItems,
      selectedDetail: action.promotion,
      detailLoading: false,
      errors: { ...state.errors, detail: null },
    });
  }

  @Action(LoadPromotionFailed)
  loadPromotionFailed(
    ctx: StateContext<PromotionsStateModel>,
    action: LoadPromotionFailed,
  ) {
    ctx.patchState({
      detailLoading: false,
      errors: { ...ctx.getState().errors, detail: action.error },
    });
  }

  @Action(CreatePromotion)
  createPromotion(ctx: StateContext<PromotionsStateModel>, action: CreatePromotion) {
    ctx.patchState({
      mutationLoading: true,
      errors: { ...ctx.getState().errors, mutation: null },
    });
    return this.api.create(action.payload).pipe(
      tap((promotion) => {
        if (!promotion) {
          ctx.dispatch(new CreatePromotionFailed('Promotion not created'));
          return;
        }
        ctx.dispatch(new CreatePromotionSuccess(promotion));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to create promotion';
        ctx.dispatch(
          new CreatePromotionFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(CreatePromotionSuccess)
  createPromotionSuccess(
    ctx: StateContext<PromotionsStateModel>,
    action: CreatePromotionSuccess,
  ) {
    const state = ctx.getState();
    ctx.patchState({
      items: this.upsertListItem(state.items, action.promotion),
      selectedId: action.promotion.id,
      selectedDetail: action.promotion,
      mutationLoading: false,
      errors: { ...state.errors, mutation: null },
    });
  }

  @Action(CreatePromotionFailed)
  createPromotionFailed(
    ctx: StateContext<PromotionsStateModel>,
    action: CreatePromotionFailed,
  ) {
    ctx.patchState({
      mutationLoading: false,
      errors: { ...ctx.getState().errors, mutation: action.error },
    });
  }

  @Action(UpdatePromotion)
  updatePromotion(ctx: StateContext<PromotionsStateModel>, action: UpdatePromotion) {
    ctx.patchState({
      mutationLoading: true,
      errors: { ...ctx.getState().errors, mutation: null },
    });
    return this.api.update(action.promotionId, action.payload).pipe(
      tap((promotion) => {
        if (!promotion) {
          ctx.dispatch(new UpdatePromotionFailed('Promotion not updated'));
          return;
        }
        ctx.dispatch(new UpdatePromotionSuccess(promotion));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to update promotion';
        ctx.dispatch(
          new UpdatePromotionFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(UpdatePromotionSuccess)
  updatePromotionSuccess(
    ctx: StateContext<PromotionsStateModel>,
    action: UpdatePromotionSuccess,
  ) {
    const state = ctx.getState();
    ctx.patchState({
      items: this.upsertListItem(state.items, action.promotion),
      selectedDetail: action.promotion,
      mutationLoading: false,
      errors: { ...state.errors, mutation: null },
    });
  }

  @Action(UpdatePromotionFailed)
  updatePromotionFailed(
    ctx: StateContext<PromotionsStateModel>,
    action: UpdatePromotionFailed,
  ) {
    ctx.patchState({
      mutationLoading: false,
      errors: { ...ctx.getState().errors, mutation: action.error },
    });
  }

  @Action(UpdatePromotionStatus)
  updatePromotionStatus(
    ctx: StateContext<PromotionsStateModel>,
    action: UpdatePromotionStatus,
  ) {
    ctx.patchState({
      mutationLoading: true,
      errors: { ...ctx.getState().errors, mutation: null },
    });
    return this.api.updateStatus(action.promotionId, action.payload).pipe(
      tap((promotion) => {
        if (!promotion) {
          ctx.dispatch(new UpdatePromotionStatusFailed('Promotion not updated'));
          return;
        }
        ctx.dispatch(new UpdatePromotionStatusSuccess(promotion));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to update promotion status';
        ctx.dispatch(
          new UpdatePromotionStatusFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(UpdatePromotionStatusSuccess)
  updatePromotionStatusSuccess(
    ctx: StateContext<PromotionsStateModel>,
    action: UpdatePromotionStatusSuccess,
  ) {
    const state = ctx.getState();
    ctx.patchState({
      items: this.upsertListItem(state.items, action.promotion),
      selectedDetail: action.promotion,
      mutationLoading: false,
      errors: { ...state.errors, mutation: null },
    });
  }

  @Action(UpdatePromotionStatusFailed)
  updatePromotionStatusFailed(
    ctx: StateContext<PromotionsStateModel>,
    action: UpdatePromotionStatusFailed,
  ) {
    ctx.patchState({
      mutationLoading: false,
      errors: { ...ctx.getState().errors, mutation: action.error },
    });
  }

  @Action(ReplacePromotionRules)
  replacePromotionRules(
    ctx: StateContext<PromotionsStateModel>,
    action: ReplacePromotionRules,
  ) {
    ctx.patchState({
      rulesLoading: true,
      errors: { ...ctx.getState().errors, rules: null },
    });
    return this.api.replaceRules(action.promotionId, action.payload).pipe(
      tap((promotion) => {
        if (!promotion) {
          ctx.dispatch(new ReplacePromotionRulesFailed('Rules not updated'));
          return;
        }
        ctx.dispatch(new ReplacePromotionRulesSuccess(promotion));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to update rules';
        ctx.dispatch(
          new ReplacePromotionRulesFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(ReplacePromotionRulesSuccess)
  replacePromotionRulesSuccess(
    ctx: StateContext<PromotionsStateModel>,
    action: ReplacePromotionRulesSuccess,
  ) {
    const state = ctx.getState();
    ctx.patchState({
      items: this.upsertListItem(state.items, action.promotion),
      selectedDetail: action.promotion,
      rulesLoading: false,
      errors: { ...state.errors, rules: null },
    });
  }

  @Action(ReplacePromotionRulesFailed)
  replacePromotionRulesFailed(
    ctx: StateContext<PromotionsStateModel>,
    action: ReplacePromotionRulesFailed,
  ) {
    ctx.patchState({
      rulesLoading: false,
      errors: { ...ctx.getState().errors, rules: action.error },
    });
  }

  @Action(DeletePromotion)
  deletePromotion(ctx: StateContext<PromotionsStateModel>, action: DeletePromotion) {
    ctx.patchState({
      mutationLoading: true,
      errors: { ...ctx.getState().errors, mutation: null },
    });
    return this.api.delete(action.promotionId).pipe(
      tap(() => {
        ctx.dispatch(new DeletePromotionSuccess(action.promotionId));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to delete promotion';
        ctx.dispatch(
          new DeletePromotionFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(DeletePromotionSuccess)
  deletePromotionSuccess(
    ctx: StateContext<PromotionsStateModel>,
    action: DeletePromotionSuccess,
  ) {
    const state = ctx.getState();
    const nextItems = state.items.filter((item) => item.id !== action.promotionId);
    const selectedDetail =
      state.selectedDetail?.id === action.promotionId ? null : state.selectedDetail;
    ctx.patchState({
      items: nextItems,
      selectedDetail,
      selectedId: selectedDetail?.id ?? null,
      mutationLoading: false,
      errors: { ...state.errors, mutation: null },
    });
  }

  @Action(DeletePromotionFailed)
  deletePromotionFailed(
    ctx: StateContext<PromotionsStateModel>,
    action: DeletePromotionFailed,
  ) {
    ctx.patchState({
      mutationLoading: false,
      errors: { ...ctx.getState().errors, mutation: action.error },
    });
  }

  @Action(SelectPromotion)
  selectPromotion(ctx: StateContext<PromotionsStateModel>, action: SelectPromotion) {
    ctx.patchState({ selectedId: action.promotionId });
  }

  private upsertListItem(items: PromotionListItem[], promotion: PromotionDetail) {
    const index = items.findIndex((item) => item.id === promotion.id);
    const nextItems = [...items];
    const listItem: PromotionListItem = {
      id: promotion.id,
      code: promotion.code,
      type: promotion.type,
      status: promotion.status,
      isAutomatic: promotion.isAutomatic,
      startsAt: promotion.startsAt ?? null,
      endsAt: promotion.endsAt ?? null,
      isActive: promotion.isActive,
      usageLimit: promotion.usageLimit ?? null,
      campaignIds: promotion.campaignIds ?? [],
      createdAt: promotion.createdAt ?? null,
      updatedAt: promotion.updatedAt ?? null,
    };
    if (index >= 0) {
      nextItems[index] = listItem;
    } else {
      nextItems.unshift(listItem);
    }
    return nextItems;
  }
}
