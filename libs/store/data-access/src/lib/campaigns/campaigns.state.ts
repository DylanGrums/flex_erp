import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, of, tap } from 'rxjs';
import { CampaignDetail, CampaignListItem } from '@flex-erp/store/util';
import {
  AttachPromotionToCampaign,
  AttachPromotionToCampaignFailed,
  AttachPromotionToCampaignSuccess,
  CreateCampaign,
  CreateCampaignFailed,
  CreateCampaignSuccess,
  DetachPromotionFromCampaign,
  DetachPromotionFromCampaignFailed,
  DetachPromotionFromCampaignSuccess,
  LoadCampaign,
  LoadCampaignFailed,
  LoadCampaignSuccess,
  LoadCampaigns,
  LoadCampaignsFailed,
  LoadCampaignsSuccess,
  SelectCampaign,
  UpdateCampaign,
  UpdateCampaignFailed,
  UpdateCampaignSuccess,
} from './campaigns.actions';
import { CampaignsApi } from './campaigns.api';
import { CampaignsStateModel } from './campaigns.models';

const DEFAULT_STATE: CampaignsStateModel = {
  items: [],
  total: 0,
  limit: 20,
  offset: 0,
  selectedId: null,
  selectedDetail: null,
  listLoading: false,
  detailLoading: false,
  mutationLoading: false,
  errors: {
    list: null,
    detail: null,
    mutation: null,
  },
};

@State<CampaignsStateModel>({
  name: 'storeCampaigns',
  defaults: DEFAULT_STATE,
})
@Injectable()
export class CampaignsState {
  private api = inject(CampaignsApi);

  @Selector()
  static items(state: CampaignsStateModel) {
    return state.items;
  }

  @Selector()
  static total(state: CampaignsStateModel) {
    return state.total;
  }

  @Selector()
  static limit(state: CampaignsStateModel) {
    return state.limit;
  }

  @Selector()
  static offset(state: CampaignsStateModel) {
    return state.offset;
  }

  @Selector()
  static selectedId(state: CampaignsStateModel) {
    return state.selectedId;
  }

  @Selector()
  static selectedDetail(state: CampaignsStateModel) {
    return state.selectedDetail;
  }

  @Selector()
  static listLoading(state: CampaignsStateModel) {
    return state.listLoading;
  }

  @Selector()
  static detailLoading(state: CampaignsStateModel) {
    return state.detailLoading;
  }

  @Selector()
  static mutationLoading(state: CampaignsStateModel) {
    return state.mutationLoading;
  }

  @Selector()
  static errors(state: CampaignsStateModel) {
    return state.errors;
  }

  @Action(LoadCampaigns)
  loadCampaigns(ctx: StateContext<CampaignsStateModel>, action: LoadCampaigns) {
    ctx.patchState({
      listLoading: true,
      errors: { ...ctx.getState().errors, list: null },
    });
    return this.api.list(action.params).pipe(
      tap((response) => {
        if (!response) {
          ctx.dispatch(new LoadCampaignsFailed('Failed to load campaigns'));
          return;
        }
        ctx.dispatch(new LoadCampaignsSuccess(response));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to load campaigns';
        ctx.dispatch(
          new LoadCampaignsFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(LoadCampaignsSuccess)
  loadCampaignsSuccess(
    ctx: StateContext<CampaignsStateModel>,
    action: LoadCampaignsSuccess,
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

  @Action(LoadCampaignsFailed)
  loadCampaignsFailed(
    ctx: StateContext<CampaignsStateModel>,
    action: LoadCampaignsFailed,
  ) {
    ctx.patchState({
      listLoading: false,
      errors: { ...ctx.getState().errors, list: action.error },
    });
  }

  @Action(LoadCampaign)
  loadCampaign(ctx: StateContext<CampaignsStateModel>, action: LoadCampaign) {
    ctx.patchState({
      detailLoading: true,
      selectedId: action.campaignId,
      errors: { ...ctx.getState().errors, detail: null },
    });
    return this.api.getById(action.campaignId).pipe(
      tap((campaign) => {
        if (!campaign) {
          ctx.dispatch(new LoadCampaignFailed('Campaign not found'));
          return;
        }
        ctx.dispatch(new LoadCampaignSuccess(campaign));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to load campaign';
        ctx.dispatch(
          new LoadCampaignFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(LoadCampaignSuccess)
  loadCampaignSuccess(
    ctx: StateContext<CampaignsStateModel>,
    action: LoadCampaignSuccess,
  ) {
    const state = ctx.getState();
    ctx.patchState({
      items: this.upsertListItem(state.items, action.campaign),
      selectedDetail: action.campaign,
      detailLoading: false,
      errors: { ...state.errors, detail: null },
    });
  }

  @Action(LoadCampaignFailed)
  loadCampaignFailed(
    ctx: StateContext<CampaignsStateModel>,
    action: LoadCampaignFailed,
  ) {
    ctx.patchState({
      detailLoading: false,
      errors: { ...ctx.getState().errors, detail: action.error },
    });
  }

  @Action(CreateCampaign)
  createCampaign(ctx: StateContext<CampaignsStateModel>, action: CreateCampaign) {
    ctx.patchState({
      mutationLoading: true,
      errors: { ...ctx.getState().errors, mutation: null },
    });
    return this.api.create(action.payload).pipe(
      tap((campaign) => {
        if (!campaign) {
          ctx.dispatch(new CreateCampaignFailed('Campaign not created'));
          return;
        }
        ctx.dispatch(new CreateCampaignSuccess(campaign));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to create campaign';
        ctx.dispatch(
          new CreateCampaignFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(CreateCampaignSuccess)
  createCampaignSuccess(
    ctx: StateContext<CampaignsStateModel>,
    action: CreateCampaignSuccess,
  ) {
    const state = ctx.getState();
    ctx.patchState({
      items: this.upsertListItem(state.items, action.campaign),
      selectedId: action.campaign.id,
      selectedDetail: action.campaign,
      mutationLoading: false,
      errors: { ...state.errors, mutation: null },
    });
  }

  @Action(CreateCampaignFailed)
  createCampaignFailed(
    ctx: StateContext<CampaignsStateModel>,
    action: CreateCampaignFailed,
  ) {
    ctx.patchState({
      mutationLoading: false,
      errors: { ...ctx.getState().errors, mutation: action.error },
    });
  }

  @Action(UpdateCampaign)
  updateCampaign(ctx: StateContext<CampaignsStateModel>, action: UpdateCampaign) {
    ctx.patchState({
      mutationLoading: true,
      errors: { ...ctx.getState().errors, mutation: null },
    });
    return this.api.update(action.campaignId, action.payload).pipe(
      tap((campaign) => {
        if (!campaign) {
          ctx.dispatch(new UpdateCampaignFailed('Campaign not updated'));
          return;
        }
        ctx.dispatch(new UpdateCampaignSuccess(campaign));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to update campaign';
        ctx.dispatch(
          new UpdateCampaignFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(UpdateCampaignSuccess)
  updateCampaignSuccess(
    ctx: StateContext<CampaignsStateModel>,
    action: UpdateCampaignSuccess,
  ) {
    const state = ctx.getState();
    ctx.patchState({
      items: this.upsertListItem(state.items, action.campaign),
      selectedDetail: action.campaign,
      mutationLoading: false,
      errors: { ...state.errors, mutation: null },
    });
  }

  @Action(UpdateCampaignFailed)
  updateCampaignFailed(
    ctx: StateContext<CampaignsStateModel>,
    action: UpdateCampaignFailed,
  ) {
    ctx.patchState({
      mutationLoading: false,
      errors: { ...ctx.getState().errors, mutation: action.error },
    });
  }

  @Action(AttachPromotionToCampaign)
  attachPromotion(
    ctx: StateContext<CampaignsStateModel>,
    action: AttachPromotionToCampaign,
  ) {
    ctx.patchState({
      mutationLoading: true,
      errors: { ...ctx.getState().errors, mutation: null },
    });
    return this.api.attachPromotion(action.campaignId, action.promotionId).pipe(
      tap((campaign) => {
        if (!campaign) {
          ctx.dispatch(new AttachPromotionToCampaignFailed('Campaign not updated'));
          return;
        }
        ctx.dispatch(new AttachPromotionToCampaignSuccess(campaign));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to attach promotion';
        ctx.dispatch(
          new AttachPromotionToCampaignFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(AttachPromotionToCampaignSuccess)
  attachPromotionSuccess(
    ctx: StateContext<CampaignsStateModel>,
    action: AttachPromotionToCampaignSuccess,
  ) {
    const state = ctx.getState();
    ctx.patchState({
      items: this.upsertListItem(state.items, action.campaign),
      selectedDetail: action.campaign,
      mutationLoading: false,
      errors: { ...state.errors, mutation: null },
    });
  }

  @Action(AttachPromotionToCampaignFailed)
  attachPromotionFailed(
    ctx: StateContext<CampaignsStateModel>,
    action: AttachPromotionToCampaignFailed,
  ) {
    ctx.patchState({
      mutationLoading: false,
      errors: { ...ctx.getState().errors, mutation: action.error },
    });
  }

  @Action(DetachPromotionFromCampaign)
  detachPromotion(
    ctx: StateContext<CampaignsStateModel>,
    action: DetachPromotionFromCampaign,
  ) {
    ctx.patchState({
      mutationLoading: true,
      errors: { ...ctx.getState().errors, mutation: null },
    });
    return this.api.detachPromotion(action.campaignId, action.promotionId).pipe(
      tap((campaign) => {
        if (!campaign) {
          ctx.dispatch(new DetachPromotionFromCampaignFailed('Campaign not updated'));
          return;
        }
        ctx.dispatch(new DetachPromotionFromCampaignSuccess(campaign));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to detach promotion';
        ctx.dispatch(
          new DetachPromotionFromCampaignFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(DetachPromotionFromCampaignSuccess)
  detachPromotionSuccess(
    ctx: StateContext<CampaignsStateModel>,
    action: DetachPromotionFromCampaignSuccess,
  ) {
    const state = ctx.getState();
    ctx.patchState({
      items: this.upsertListItem(state.items, action.campaign),
      selectedDetail: action.campaign,
      mutationLoading: false,
      errors: { ...state.errors, mutation: null },
    });
  }

  @Action(DetachPromotionFromCampaignFailed)
  detachPromotionFailed(
    ctx: StateContext<CampaignsStateModel>,
    action: DetachPromotionFromCampaignFailed,
  ) {
    ctx.patchState({
      mutationLoading: false,
      errors: { ...ctx.getState().errors, mutation: action.error },
    });
  }

  @Action(SelectCampaign)
  selectCampaign(ctx: StateContext<CampaignsStateModel>, action: SelectCampaign) {
    ctx.patchState({ selectedId: action.campaignId });
  }

  private upsertListItem(items: CampaignListItem[], campaign: CampaignDetail) {
    const index = items.findIndex((item) => item.id === campaign.id);
    const nextItems = [...items];
    const listItem: CampaignListItem = {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description ?? null,
      startsAt: campaign.startsAt ?? null,
      endsAt: campaign.endsAt ?? null,
      isActive: campaign.isActive,
      budget: campaign.budget,
      createdAt: campaign.createdAt ?? null,
      updatedAt: campaign.updatedAt ?? null,
    };
    if (index >= 0) {
      nextItems[index] = listItem;
    } else {
      nextItems.unshift(listItem);
    }
    return nextItems;
  }
}
