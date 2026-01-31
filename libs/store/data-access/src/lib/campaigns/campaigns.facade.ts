import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';
import {
  CampaignCreatePayload,
  CampaignUpdatePayload,
} from '@flex-erp/store/util';
import {
  AttachPromotionToCampaign,
  CreateCampaign,
  DetachPromotionFromCampaign,
  LoadCampaign,
  LoadCampaigns,
  SelectCampaign,
  UpdateCampaign,
} from './campaigns.actions';
import { CampaignsListParams } from './campaigns.models';
import { CampaignsState } from './campaigns.state';

@Injectable({ providedIn: 'root' })
export class CampaignsFacade {
  private store = inject(Store);

  readonly items$ = this.store.select(CampaignsState.items);
  readonly total$ = this.store.select(CampaignsState.total);
  readonly limit$ = this.store.select(CampaignsState.limit);
  readonly offset$ = this.store.select(CampaignsState.offset);
  readonly selectedId$ = this.store.select(CampaignsState.selectedId);
  readonly selectedDetail$ = this.store.select(CampaignsState.selectedDetail);
  readonly listLoading$ = this.store.select(CampaignsState.listLoading);
  readonly detailLoading$ = this.store.select(CampaignsState.detailLoading);
  readonly mutationLoading$ = this.store.select(CampaignsState.mutationLoading);
  readonly errors$ = this.store.select(CampaignsState.errors);

  readonly items = toSignal(this.items$, { initialValue: [] });
  readonly total = toSignal(this.total$, { initialValue: 0 });
  readonly limit = toSignal(this.limit$, { initialValue: 20 });
  readonly offset = toSignal(this.offset$, { initialValue: 0 });
  readonly selectedId = toSignal(this.selectedId$, { initialValue: null });
  readonly selectedDetail = toSignal(this.selectedDetail$, { initialValue: null });
  readonly listLoading = toSignal(this.listLoading$, { initialValue: false });
  readonly detailLoading = toSignal(this.detailLoading$, { initialValue: false });
  readonly mutationLoading = toSignal(this.mutationLoading$, { initialValue: false });
  readonly errors = toSignal(this.errors$, {
    initialValue: { list: null, detail: null, mutation: null },
  });

  loadCampaigns(params: CampaignsListParams = {}) {
    return this.store.dispatch(new LoadCampaigns(params));
  }

  loadCampaign(campaignId: string) {
    return this.store.dispatch(new LoadCampaign(campaignId));
  }

  createCampaign(payload: CampaignCreatePayload) {
    return this.store.dispatch(new CreateCampaign(payload));
  }

  updateCampaign(campaignId: string, payload: CampaignUpdatePayload) {
    return this.store.dispatch(new UpdateCampaign(campaignId, payload));
  }

  attachPromotion(campaignId: string, promotionId: string) {
    return this.store.dispatch(
      new AttachPromotionToCampaign(campaignId, promotionId),
    );
  }

  detachPromotion(campaignId: string, promotionId: string) {
    return this.store.dispatch(
      new DetachPromotionFromCampaign(campaignId, promotionId),
    );
  }

  selectCampaign(campaignId: string | null) {
    return this.store.dispatch(new SelectCampaign(campaignId));
  }
}
