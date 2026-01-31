import {
  PromotionCreatePayload,
  PromotionDetail,
  PromotionListItem,
  PromotionRulesReplacePayload,
  PromotionStatusUpdatePayload,
  PromotionUpdatePayload,
} from '@flex-erp/store/util';
import { PromotionsListParams, PromotionsListResponse } from './promotions.models';

export class LoadPromotions {
  static readonly type = '[Promotions] Load list';
  constructor(public params: PromotionsListParams = {}) {}
}

export class LoadPromotionsSuccess {
  static readonly type = '[Promotions] Load list success';
  constructor(public response: PromotionsListResponse) {}
}

export class LoadPromotionsFailed {
  static readonly type = '[Promotions] Load list failed';
  constructor(public error: string) {}
}

export class LoadPromotion {
  static readonly type = '[Promotions] Load detail';
  constructor(public promotionId: string) {}
}

export class LoadPromotionSuccess {
  static readonly type = '[Promotions] Load detail success';
  constructor(public promotion: PromotionDetail) {}
}

export class LoadPromotionFailed {
  static readonly type = '[Promotions] Load detail failed';
  constructor(public error: string) {}
}

export class CreatePromotion {
  static readonly type = '[Promotions] Create';
  constructor(public payload: PromotionCreatePayload) {}
}

export class CreatePromotionSuccess {
  static readonly type = '[Promotions] Create success';
  constructor(public promotion: PromotionDetail) {}
}

export class CreatePromotionFailed {
  static readonly type = '[Promotions] Create failed';
  constructor(public error: string) {}
}

export class UpdatePromotion {
  static readonly type = '[Promotions] Update';
  constructor(public promotionId: string, public payload: PromotionUpdatePayload) {}
}

export class UpdatePromotionSuccess {
  static readonly type = '[Promotions] Update success';
  constructor(public promotion: PromotionDetail) {}
}

export class UpdatePromotionFailed {
  static readonly type = '[Promotions] Update failed';
  constructor(public error: string) {}
}

export class UpdatePromotionStatus {
  static readonly type = '[Promotions] Update status';
  constructor(public promotionId: string, public payload: PromotionStatusUpdatePayload) {}
}

export class UpdatePromotionStatusSuccess {
  static readonly type = '[Promotions] Update status success';
  constructor(public promotion: PromotionDetail) {}
}

export class UpdatePromotionStatusFailed {
  static readonly type = '[Promotions] Update status failed';
  constructor(public error: string) {}
}

export class ReplacePromotionRules {
  static readonly type = '[Promotions] Replace rules';
  constructor(public promotionId: string, public payload: PromotionRulesReplacePayload) {}
}

export class ReplacePromotionRulesSuccess {
  static readonly type = '[Promotions] Replace rules success';
  constructor(public promotion: PromotionDetail) {}
}

export class ReplacePromotionRulesFailed {
  static readonly type = '[Promotions] Replace rules failed';
  constructor(public error: string) {}
}

export class DeletePromotion {
  static readonly type = '[Promotions] Delete';
  constructor(public promotionId: string) {}
}

export class DeletePromotionSuccess {
  static readonly type = '[Promotions] Delete success';
  constructor(public promotionId: string) {}
}

export class DeletePromotionFailed {
  static readonly type = '[Promotions] Delete failed';
  constructor(public error: string) {}
}

export class SelectPromotion {
  static readonly type = '[Promotions] Select';
  constructor(public promotionId: string | null) {}
}

export type PromotionListItemUpdated = PromotionListItem | PromotionDetail;
