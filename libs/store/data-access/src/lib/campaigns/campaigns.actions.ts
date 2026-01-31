import {
  CampaignCreatePayload,
  CampaignDetail,
  CampaignListItem,
  CampaignUpdatePayload,
} from '@flex-erp/store/util';
import { CampaignsListParams, CampaignsListResponse } from './campaigns.models';

export class LoadCampaigns {
  static readonly type = '[Campaigns] Load list';
  constructor(public params: CampaignsListParams = {}) {}
}

export class LoadCampaignsSuccess {
  static readonly type = '[Campaigns] Load list success';
  constructor(public response: CampaignsListResponse) {}
}

export class LoadCampaignsFailed {
  static readonly type = '[Campaigns] Load list failed';
  constructor(public error: string) {}
}

export class LoadCampaign {
  static readonly type = '[Campaigns] Load detail';
  constructor(public campaignId: string) {}
}

export class LoadCampaignSuccess {
  static readonly type = '[Campaigns] Load detail success';
  constructor(public campaign: CampaignDetail) {}
}

export class LoadCampaignFailed {
  static readonly type = '[Campaigns] Load detail failed';
  constructor(public error: string) {}
}

export class CreateCampaign {
  static readonly type = '[Campaigns] Create';
  constructor(public payload: CampaignCreatePayload) {}
}

export class CreateCampaignSuccess {
  static readonly type = '[Campaigns] Create success';
  constructor(public campaign: CampaignDetail) {}
}

export class CreateCampaignFailed {
  static readonly type = '[Campaigns] Create failed';
  constructor(public error: string) {}
}

export class UpdateCampaign {
  static readonly type = '[Campaigns] Update';
  constructor(public campaignId: string, public payload: CampaignUpdatePayload) {}
}

export class UpdateCampaignSuccess {
  static readonly type = '[Campaigns] Update success';
  constructor(public campaign: CampaignDetail) {}
}

export class UpdateCampaignFailed {
  static readonly type = '[Campaigns] Update failed';
  constructor(public error: string) {}
}

export class AttachPromotionToCampaign {
  static readonly type = '[Campaigns] Attach promotion';
  constructor(public campaignId: string, public promotionId: string) {}
}

export class AttachPromotionToCampaignSuccess {
  static readonly type = '[Campaigns] Attach promotion success';
  constructor(public campaign: CampaignDetail) {}
}

export class AttachPromotionToCampaignFailed {
  static readonly type = '[Campaigns] Attach promotion failed';
  constructor(public error: string) {}
}

export class DetachPromotionFromCampaign {
  static readonly type = '[Campaigns] Detach promotion';
  constructor(public campaignId: string, public promotionId: string) {}
}

export class DetachPromotionFromCampaignSuccess {
  static readonly type = '[Campaigns] Detach promotion success';
  constructor(public campaign: CampaignDetail) {}
}

export class DetachPromotionFromCampaignFailed {
  static readonly type = '[Campaigns] Detach promotion failed';
  constructor(public error: string) {}
}

export class SelectCampaign {
  static readonly type = '[Campaigns] Select';
  constructor(public campaignId: string | null) {}
}

export type CampaignListItemUpdated = CampaignListItem | CampaignDetail;
