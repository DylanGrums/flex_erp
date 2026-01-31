import { CampaignDetail, CampaignListItem, PagedResult } from '@flex-erp/store/util';

export interface CampaignsListParams {
  limit?: number;
  offset?: number;
  q?: string | null;
  isActive?: boolean | null;
}

export interface CampaignsStateModel {
  items: CampaignListItem[];
  total: number;
  limit: number;
  offset: number;
  selectedId: string | null;
  selectedDetail: CampaignDetail | null;
  listLoading: boolean;
  detailLoading: boolean;
  mutationLoading: boolean;
  errors: {
    list: string | null;
    detail: string | null;
    mutation: string | null;
  };
}

export type CampaignsListResponse = PagedResult<CampaignListItem>;
