import { Collection, Section } from '@flex-erp/cms/types';

export type CmsPageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type CmsAssetKind = 'IMAGE' | 'VIDEO' | 'FILE';
export type CmsMenuItemType = 'URL' | 'INTERNAL_PAGE';

export type CmsSiteCreatePayload = {
  name: string;
  domain?: string | null;
  locale?: string | null;
  settingsSchemaVersion?: number;
  settings?: unknown | null;
};

export type CmsSiteUpdatePayload = Partial<CmsSiteCreatePayload>;

export type CmsPageCreatePayload = {
  siteId: string;
  slug: string;
  title: string;
  status?: CmsPageStatus | string | null;
};

export type CmsPageUpdatePayload = Partial<
  Pick<CmsPageCreatePayload, 'slug' | 'title' | 'status'>
>;

export type CmsPagePublishPayload = {
  versionId?: string | null;
};

export type CmsPageVersionCreatePayload = {
  content: unknown;
  contentSchemaVersion?: number;
  createdByUserId?: string | null;
};

export type CmsAssetCreatePayload = {
  siteId: string;
  kind: CmsAssetKind | string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  checksum?: string | null;
  width?: number | null;
  height?: number | null;
  createdByUserId?: string | null;
};

export type CmsMenuCreatePayload = {
  siteId: string;
  key: string;
  title: string;
};

export type CmsMenuUpdatePayload = {
  title?: string | null;
};

export type CmsMenuItemCreatePayload = {
  menuId: string;
  parentId?: string | null;
  label: string;
  type: CmsMenuItemType | string;
  href?: string | null;
  pageId?: string | null;
  position?: number | null;
};

export type CmsMenuItemUpdatePayload = Partial<
  Pick<CmsMenuItemCreatePayload, 'label' | 'type' | 'href' | 'pageId' | 'parentId' | 'position'>
>;

export type CmsMenuItemReorderPayload = {
  items: Array<{ id: string; parentId?: string | null; position: number }>;
};

export interface CmsSite {
  id: string;
  name: string;
  domain?: string | null;
  locale?: string | null;
  settingsSchemaVersion?: number;
  settings?: unknown | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CmsPage {
  id: string;
  siteId: string;
  slug: string;
  title: string;
  status: CmsPageStatus | string;
  publishedVersionId?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CmsPageVersion {
  id: string;
  pageId: string;
  version: number;
  contentSchemaVersion: number;
  content: unknown;
  createdByUserId?: string | null;
  createdAt: string;
}

export interface CmsAsset {
  id: string;
  siteId: string;
  kind: CmsAssetKind | string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  checksum?: string | null;
  width?: number | null;
  height?: number | null;
  createdByUserId?: string | null;
  createdAt?: string;
}

export interface CmsMenu {
  id: string;
  siteId: string;
  key: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CmsMenuItem {
  id: string;
  menuId: string;
  parentId?: string | null;
  label: string;
  type: CmsMenuItemType | string;
  href?: string | null;
  pageId?: string | null;
  position?: number | null;
}

export interface CmsMenuItemTree extends CmsMenuItem {
  children?: CmsMenuItemTree[];
}

export interface CmsPageContent {
  sections: Section[];
}

export type CmsCollection = Collection;

