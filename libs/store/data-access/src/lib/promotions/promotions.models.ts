import {
  PagedResult,
  PromotionDetail,
  PromotionListItem,
} from '@flex-erp/store/util';

export interface PromotionsListParams {
  limit?: number;
  offset?: number;
  q?: string | null;
  status?: string | null;
  isActive?: boolean | null;
  campaignId?: string | null;
}

export interface PromotionsStateModel {
  items: PromotionListItem[];
  total: number;
  limit: number;
  offset: number;
  selectedId: string | null;
  selectedDetail: PromotionDetail | null;
  listLoading: boolean;
  detailLoading: boolean;
  mutationLoading: boolean;
  rulesLoading: boolean;
  errors: {
    list: string | null;
    detail: string | null;
    mutation: string | null;
    rules: string | null;
  };
}

export type PromotionsListResponse = PagedResult<PromotionListItem>;
