import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';
import {
  PromotionCreatePayload,
  PromotionRulesReplacePayload,
  PromotionStatusUpdatePayload,
  PromotionUpdatePayload,
} from '@flex-erp/store/util';
import {
  CreatePromotion,
  DeletePromotion,
  LoadPromotion,
  LoadPromotions,
  ReplacePromotionRules,
  SelectPromotion,
  UpdatePromotion,
  UpdatePromotionStatus,
} from './promotions.actions';
import { PromotionsListParams } from './promotions.models';
import { PromotionsState } from './promotions.state';

@Injectable({ providedIn: 'root' })
export class PromotionsFacade {
  private store = inject(Store);

  readonly items$ = this.store.select(PromotionsState.items);
  readonly total$ = this.store.select(PromotionsState.total);
  readonly limit$ = this.store.select(PromotionsState.limit);
  readonly offset$ = this.store.select(PromotionsState.offset);
  readonly selectedId$ = this.store.select(PromotionsState.selectedId);
  readonly selectedDetail$ = this.store.select(PromotionsState.selectedDetail);
  readonly listLoading$ = this.store.select(PromotionsState.listLoading);
  readonly detailLoading$ = this.store.select(PromotionsState.detailLoading);
  readonly mutationLoading$ = this.store.select(PromotionsState.mutationLoading);
  readonly rulesLoading$ = this.store.select(PromotionsState.rulesLoading);
  readonly errors$ = this.store.select(PromotionsState.errors);

  readonly items = toSignal(this.items$, { initialValue: [] });
  readonly total = toSignal(this.total$, { initialValue: 0 });
  readonly limit = toSignal(this.limit$, { initialValue: 20 });
  readonly offset = toSignal(this.offset$, { initialValue: 0 });
  readonly selectedId = toSignal(this.selectedId$, { initialValue: null });
  readonly selectedDetail = toSignal(this.selectedDetail$, { initialValue: null });
  readonly listLoading = toSignal(this.listLoading$, { initialValue: false });
  readonly detailLoading = toSignal(this.detailLoading$, { initialValue: false });
  readonly mutationLoading = toSignal(this.mutationLoading$, { initialValue: false });
  readonly rulesLoading = toSignal(this.rulesLoading$, { initialValue: false });
  readonly errors = toSignal(this.errors$, {
    initialValue: { list: null, detail: null, mutation: null, rules: null },
  });

  loadPromotions(params: PromotionsListParams = {}) {
    return this.store.dispatch(new LoadPromotions(params));
  }

  loadPromotion(promotionId: string) {
    return this.store.dispatch(new LoadPromotion(promotionId));
  }

  createPromotion(payload: PromotionCreatePayload) {
    return this.store.dispatch(new CreatePromotion(payload));
  }

  updatePromotion(promotionId: string, payload: PromotionUpdatePayload) {
    return this.store.dispatch(new UpdatePromotion(promotionId, payload));
  }

  updatePromotionStatus(
    promotionId: string,
    payload: PromotionStatusUpdatePayload,
  ) {
    return this.store.dispatch(new UpdatePromotionStatus(promotionId, payload));
  }

  replacePromotionRules(
    promotionId: string,
    payload: PromotionRulesReplacePayload,
  ) {
    return this.store.dispatch(new ReplacePromotionRules(promotionId, payload));
  }

  deletePromotion(promotionId: string) {
    return this.store.dispatch(new DeletePromotion(promotionId));
  }

  selectPromotion(promotionId: string | null) {
    return this.store.dispatch(new SelectPromotion(promotionId));
  }
}
