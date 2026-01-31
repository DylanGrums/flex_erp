export type StoreId = string;

export interface StoreSummary {
  id: StoreId;
  name: string;
}

export interface Product {
  id: string;
  title: string;
  handle?: string | null;
  description?: string | null;
  status?: string | null;
  options?: string[];
  variants?: ProductVariant[];
  images?: string[];
}

export interface ProductVariant {
  id?: string;
  sku?: string | null;
  price?: number | null;
  optionValues?: string[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  position?: number | null;
}

export interface ProductOptionValue {
  id: string;
  value: string;
  position?: number | null;
}

export interface ProductOption {
  id: string;
  name: string;
  position?: number | null;
  values?: ProductOptionValue[];
}

export interface ProductVariantOptionValue {
  id: string;
  value: string;
  optionId: string;
  optionName?: string | null;
}

export interface ProductVariantDetail {
  id: string;
  title: string;
  sku?: string | null;
  priceAmount?: number | null;
  price?: number | null;
  inventoryQuantity?: number | null;
  allowBackorder?: boolean | null;
  optionValues?: ProductVariantOptionValue[];
}

export interface ProductCollection {
  id: string;
  title: string;
  handle?: string | null;
  description?: string | null;
}

export interface ProductDetail {
  id: string;
  title: string;
  handle?: string | null;
  description?: string | null;
  status?: string | null;
  images?: ProductImage[];
  options?: ProductOption[];
  variants?: ProductVariantDetail[];
  collections?: ProductCollection[];
}

export type CurrencyCode = 'EUR' | 'USD' | 'GBP';

export interface PagedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export type CampaignBudgetType = 'NONE' | 'SPEND_LIMIT' | 'USE_BY_ATTRIBUTE';
export type PromotionStatus = 'DRAFT' | 'ACTIVE' | 'DISABLED';
export type PromotionType = 'STANDARD';
export type PromotionRuleScope = 'PROMOTION' | 'TARGET' | 'BUY';
export type PromotionRuleOperator =
  | 'EQ'
  | 'NE'
  | 'IN'
  | 'NIN'
  | 'GT'
  | 'GTE'
  | 'LT'
  | 'LTE';
export type PromotionApplicationMethodType = 'FIXED' | 'PERCENT';
export type PromotionApplicationAllocation = 'EACH' | 'ACROSS';
export type PromotionTargetType = 'ITEMS';

export interface PromotionRuleInput {
  operator: PromotionRuleOperator;
  attribute: string;
  values: unknown;
}

export interface PromotionRuleDto extends PromotionRuleInput {
  id: string;
  scope: PromotionRuleScope;
}

export interface PromotionApplicationMethodInput {
  type: PromotionApplicationMethodType;
  allocation: PromotionApplicationAllocation;
  targetType: PromotionTargetType;
  value: number;
  currency?: CurrencyCode;
  maxQuantity?: number;
  isTaxInclusive?: boolean;
}

export interface PromotionApplicationMethodDto
  extends PromotionApplicationMethodInput {
  valueAmount?: number | null;
  valueBps?: number | null;
  currency: CurrencyCode;
  maxQuantity: number;
  isTaxInclusive: boolean;
}

export interface CampaignSummary {
  id: string;
  name: string;
}

export interface PromotionListItem {
  id: string;
  code: string;
  type: PromotionType;
  status: PromotionStatus;
  isAutomatic: boolean;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  isActive: boolean;
  usageLimit?: number | null;
  campaignIds: string[];
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface PromotionDetail extends PromotionListItem {
  rules: PromotionRuleDto[];
  targetRules: PromotionRuleDto[];
  buyRules: PromotionRuleDto[];
  applicationMethod: PromotionApplicationMethodDto | null;
  campaigns: CampaignSummary[];
}

export interface PromotionCreatePayload {
  code: string;
  type?: PromotionType;
  status?: PromotionStatus;
  isAutomatic?: boolean;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  isActive?: boolean;
  usageLimit?: number | null;
  metadata?: Record<string, unknown> | null;
  applicationMethod: PromotionApplicationMethodInput;
  rules?: PromotionRuleInput[];
  targetRules?: PromotionRuleInput[];
  buyRules?: PromotionRuleInput[];
  campaignId?: string | null;
}

export interface PromotionUpdatePayload {
  code?: string;
  type?: PromotionType;
  status?: PromotionStatus;
  isAutomatic?: boolean;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  isActive?: boolean;
  usageLimit?: number | null;
  metadata?: Record<string, unknown> | null;
  applicationMethod?: PromotionApplicationMethodInput;
  rules?: PromotionRuleInput[];
  targetRules?: PromotionRuleInput[];
  buyRules?: PromotionRuleInput[];
}

export interface PromotionStatusUpdatePayload {
  status: PromotionStatus;
  isActive?: boolean;
}

export interface PromotionRulesReplacePayload {
  rules?: PromotionRuleInput[];
  targetRules?: PromotionRuleInput[];
  buyRules?: PromotionRuleInput[];
}

export interface CampaignBudgetInput {
  type: CampaignBudgetType;
  limitAmount?: number | null;
  currency?: CurrencyCode;
  attribute?: string | null;
}

export interface CampaignBudgetDto {
  type: CampaignBudgetType;
  limitAmount?: number | null;
  currency: CurrencyCode;
  attribute?: string | null;
}

export interface CampaignListItem {
  id: string;
  name: string;
  description?: string | null;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  isActive: boolean;
  budget: CampaignBudgetDto;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface CampaignDetail extends CampaignListItem {
  promotions: PromotionListItem[];
}

export interface CampaignCreatePayload {
  name: string;
  description?: string | null;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  isActive?: boolean;
  budget: CampaignBudgetInput;
}

export interface CampaignUpdatePayload {
  name?: string;
  description?: string | null;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  isActive?: boolean;
  budget?: CampaignBudgetInput;
}
