import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

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
  status?: string | null;
};

export type CmsPageUpdatePayload = Partial<Pick<CmsPageCreatePayload, 'slug' | 'title' | 'status'>>;

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
  kind: string;
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
  type: string;
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

export type CmsCollectionSummary = {
  id: string;
  name: string;
  productCount: number;
  image?: string | null;
};

@Injectable()
export class CmsService implements OnModuleInit {
  private prisma = new (PrismaClient as any)({
    adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }),
  }) as any;

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async getCurrentSite(storeId: string, tenantId: string) {
    return this.prisma.cmsSite.findFirst({
      where: { storeId, tenantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listSites(storeId: string, tenantId: string) {
    return this.prisma.cmsSite.findMany({
      where: { storeId, tenantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createSite(storeId: string, tenantId: string, payload: CmsSiteCreatePayload) {
    return this.prisma.cmsSite.create({
      data: {
        tenantId,
        storeId,
        name: payload.name.trim(),
        domain: payload.domain?.trim() || null,
        locale: payload.locale?.trim() || 'fr-FR',
        settingsSchemaVersion: payload.settingsSchemaVersion ?? 1,
        settings: payload.settings ?? undefined,
      },
    });
  }

  async updateSite(
    storeId: string,
    tenantId: string,
    id: string,
    payload: CmsSiteUpdatePayload,
  ) {
    const existing = await this.prisma.cmsSite.findFirst({
      where: { id, tenantId, storeId },
    });
    if (!existing) return null;

    return this.prisma.cmsSite.update({
      where: { id },
      data: {
        name: payload.name?.trim() ?? existing.name,
        domain:
          payload.domain !== undefined
            ? payload.domain?.trim() || null
            : existing.domain,
        locale: payload.locale?.trim() ?? existing.locale,
        settingsSchemaVersion:
          payload.settingsSchemaVersion ?? existing.settingsSchemaVersion,
        settings:
          payload.settings !== undefined ? payload.settings : existing.settings,
      },
    });
  }

  async listPages(
    storeId: string,
    tenantId: string,
    params: {
      siteId: string;
      status?: string | null;
      search?: string | null;
      sort?: string | null;
      direction?: 'asc' | 'desc' | null;
      slug?: string | null;
    },
  ) {
    const where: any = { tenantId, storeId, siteId: params.siteId };
    if (params.status) {
      where.status = params.status;
    }
    if (params.slug) {
      where.slug = params.slug;
    }
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const direction = params.direction === 'asc' ? 'asc' : 'desc';
    const allowedSort = new Set(['createdAt', 'updatedAt', 'title', 'slug', 'status']);
    const sortKey = params.sort && allowedSort.has(params.sort)
      ? params.sort
      : 'createdAt';

    return this.prisma.cmsPage.findMany({
      where,
      orderBy: { [sortKey]: direction },
      select: {
        id: true,
        siteId: true,
        slug: true,
        title: true,
        status: true,
        publishedVersionId: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getPageById(storeId: string, tenantId: string, id: string) {
    return this.prisma.cmsPage.findFirst({
      where: { id, tenantId, storeId },
      include: {
        publishedVersion: true,
      },
    });
  }

  async createPage(
    storeId: string,
    tenantId: string,
    payload: CmsPageCreatePayload,
  ) {
    return this.prisma.cmsPage.create({
      data: {
        tenantId,
        storeId,
        siteId: payload.siteId,
        slug: payload.slug.trim(),
        title: payload.title.trim(),
        status: (payload.status?.toUpperCase() ?? 'DRAFT') as any,
      },
    });
  }

  async updatePage(
    storeId: string,
    tenantId: string,
    id: string,
    payload: CmsPageUpdatePayload,
  ) {
    const existing = await this.prisma.cmsPage.findFirst({
      where: { id, tenantId, storeId },
    });
    if (!existing) return null;

    return this.prisma.cmsPage.update({
      where: { id },
      data: {
        slug: payload.slug?.trim() ?? existing.slug,
        title: payload.title?.trim() ?? existing.title,
        status:
          payload.status?.toUpperCase() ??
          (existing.status as any),
      },
    });
  }

  async publishPage(
    storeId: string,
    tenantId: string,
    pageId: string,
    versionId?: string | null,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const page = await tx.cmsPage.findFirst({
        where: { id: pageId, tenantId, storeId },
      });
      if (!page) return null;

      let targetVersionId = versionId ?? null;
      if (!targetVersionId) {
        const latest = await tx.cmsPageVersion.findFirst({
          where: { pageId, tenantId, storeId },
          orderBy: { version: 'desc' },
        });
        targetVersionId = latest?.id ?? null;
      }

      if (!targetVersionId) {
        throw new BadRequestException('No page version available to publish');
      }

      const version = await tx.cmsPageVersion.findFirst({
        where: { id: targetVersionId, pageId, tenantId, storeId },
      });
      if (!version) {
        throw new BadRequestException('Version does not belong to page');
      }

      return tx.cmsPage.update({
        where: { id: pageId },
        data: {
          status: 'PUBLISHED',
          publishedVersionId: targetVersionId,
          publishedAt: new Date(),
        },
      });
    });
  }

  async unpublishPage(storeId: string, tenantId: string, pageId: string) {
    const page = await this.prisma.cmsPage.findFirst({
      where: { id: pageId, tenantId, storeId },
    });
    if (!page) return null;
    return this.prisma.cmsPage.update({
      where: { id: pageId },
      data: {
        status: 'DRAFT',
        publishedVersionId: null,
        publishedAt: null,
      },
    });
  }

  async listPageVersions(storeId: string, tenantId: string, pageId: string) {
    return this.prisma.cmsPageVersion.findMany({
      where: { pageId, tenantId, storeId },
      orderBy: { version: 'desc' },
    });
  }

  async getPageVersionById(storeId: string, tenantId: string, id: string) {
    return this.prisma.cmsPageVersion.findFirst({
      where: { id, tenantId, storeId },
    });
  }

  async createPageVersion(
    storeId: string,
    tenantId: string,
    pageId: string,
    payload: CmsPageVersionCreatePayload,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const page = await tx.cmsPage.findFirst({
        where: { id: pageId, tenantId, storeId },
      });
      if (!page) {
        throw new NotFoundException('Page not found');
      }

      const maxVersion = await tx.cmsPageVersion.aggregate({
        where: { pageId, tenantId, storeId },
        _max: { version: true },
      });
      const nextVersion = (maxVersion._max.version ?? 0) + 1;

      return tx.cmsPageVersion.create({
        data: {
          tenantId,
          storeId,
          pageId,
          version: nextVersion,
          contentSchemaVersion: payload.contentSchemaVersion ?? 1,
          content: payload.content,
          createdByUserId: payload.createdByUserId ?? null,
        },
      });
    });
  }

  async restorePageVersion(
    storeId: string,
    tenantId: string,
    versionId: string,
    createdByUserId?: string | null,
  ) {
    const version = await this.prisma.cmsPageVersion.findFirst({
      where: { id: versionId, tenantId, storeId },
    });
    if (!version) return null;

    return this.createPageVersion(storeId, tenantId, version.pageId, {
      content: version.content,
      contentSchemaVersion: version.contentSchemaVersion,
      createdByUserId: createdByUserId ?? null,
    });
  }

  async listAssets(
    storeId: string,
    tenantId: string,
    params: { siteId?: string | null; kind?: string | null; skip?: number; take?: number },
  ) {
    const where: any = { tenantId, storeId };
    if (params.siteId) where.siteId = params.siteId;
    if (params.kind) where.kind = params.kind;

    return this.prisma.cmsAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.take,
    });
  }

  async createAsset(storeId: string, tenantId: string, payload: CmsAssetCreatePayload) {
    return this.prisma.cmsAsset.create({
      data: {
        tenantId,
        storeId,
        siteId: payload.siteId,
        kind: payload.kind as any,
        filename: payload.filename,
        mimeType: payload.mimeType,
        sizeBytes: payload.sizeBytes,
        url: payload.url,
        checksum: payload.checksum ?? null,
        width: payload.width ?? null,
        height: payload.height ?? null,
        createdByUserId: payload.createdByUserId ?? null,
      },
    });
  }

  async deleteAsset(storeId: string, tenantId: string, id: string) {
    const asset = await this.prisma.cmsAsset.findFirst({
      where: { id, tenantId, storeId },
    });
    if (!asset) return null;
    await this.prisma.cmsAsset.delete({ where: { id } });
    return asset;
  }

  async saveUpload(
    storeId: string,
    tenantId: string,
    payload: {
      siteId: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
      buffer: Buffer;
      createdByUserId?: string | null;
    },
  ) {
    const assetId = randomUUID();
    const ext = path.extname(payload.filename || '').toLowerCase();
    const safeExt = ext.length > 12 ? '' : ext;
    const storedName = `${assetId}${safeExt}`;
    const uploadDir = path.join(process.cwd(), 'uploads', 'cms');
    const filePath = path.join(uploadDir, storedName);
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(filePath, payload.buffer);

    const kind = this.resolveAssetKind(payload.mimeType);
    const url = `/api/cms/assets/${assetId}/download`;

    const asset = await this.prisma.cmsAsset.create({
      data: {
        id: assetId,
        tenantId,
        storeId,
        siteId: payload.siteId,
        kind,
        filename: payload.filename,
        mimeType: payload.mimeType,
        sizeBytes: payload.sizeBytes,
        url,
        createdByUserId: payload.createdByUserId ?? null,
      },
    });

    return { asset, filePath };
  }

  async getAssetDownload(
    storeId: string,
    tenantId: string,
    assetId: string,
  ) {
    const asset = await this.prisma.cmsAsset.findFirst({
      where: { id: assetId, tenantId, storeId },
    });
    if (!asset) return null;

    const uploadDir = path.join(process.cwd(), 'uploads', 'cms');
    const files = await fs.readdir(uploadDir).catch(() => []);
    const file = files.find((name) => name.startsWith(assetId));
    if (!file) return null;

    return {
      asset,
      filePath: path.join(uploadDir, file),
    };
  }

  async listMenus(storeId: string, tenantId: string, siteId: string) {
    return this.prisma.cmsMenu.findMany({
      where: { tenantId, storeId, siteId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMenu(storeId: string, tenantId: string, payload: CmsMenuCreatePayload) {
    return this.prisma.cmsMenu.create({
      data: {
        tenantId,
        storeId,
        siteId: payload.siteId,
        key: payload.key.trim(),
        title: payload.title.trim(),
      },
    });
  }

  async updateMenu(storeId: string, tenantId: string, id: string, payload: CmsMenuUpdatePayload) {
    const existing = await this.prisma.cmsMenu.findFirst({
      where: { id, tenantId, storeId },
    });
    if (!existing) return null;

    return this.prisma.cmsMenu.update({
      where: { id },
      data: {
        title: payload.title?.trim() ?? existing.title,
      },
    });
  }

  async deleteMenu(storeId: string, tenantId: string, id: string) {
    const existing = await this.prisma.cmsMenu.findFirst({
      where: { id, tenantId, storeId },
    });
    if (!existing) return null;
    await this.prisma.cmsMenu.delete({ where: { id } });
    return existing;
  }

  async listMenuItems(storeId: string, tenantId: string, menuId: string) {
    const items = await this.prisma.cmsMenuItem.findMany({
      where: { menuId, tenantId, storeId },
      orderBy: { position: 'asc' },
    });
    return this.buildMenuTree(items);
  }

  async createMenuItem(
    storeId: string,
    tenantId: string,
    payload: CmsMenuItemCreatePayload,
  ) {
    await this.ensureMenuExists(storeId, tenantId, payload.menuId);
    await this.ensureMenuItemParent(storeId, tenantId, payload.menuId, payload.parentId ?? null);

    const normalized = this.normalizeMenuItemPayload(payload);
    return this.prisma.cmsMenuItem.create({
      data: {
        tenantId,
        storeId,
        menuId: payload.menuId,
        parentId: normalized.parentId,
        label: normalized.label,
        type: normalized.type as any,
        href: normalized.href,
        pageId: normalized.pageId,
        position: normalized.position ?? 0,
      },
    });
  }

  async updateMenuItem(
    storeId: string,
    tenantId: string,
    menuId: string,
    itemId: string,
    payload: CmsMenuItemUpdatePayload,
  ) {
    const existing = await this.prisma.cmsMenuItem.findFirst({
      where: { id: itemId, tenantId, storeId, menuId },
    });
    if (!existing) return null;

    const normalized = this.normalizeMenuItemPayload({
      ...existing,
      ...payload,
      menuId,
    } as CmsMenuItemCreatePayload);

    await this.ensureMenuItemParent(storeId, tenantId, menuId, normalized.parentId ?? null, itemId);

    return this.prisma.cmsMenuItem.update({
      where: { id: itemId },
      data: {
        label: normalized.label,
        type: normalized.type as any,
        href: normalized.href,
        pageId: normalized.pageId,
        parentId: normalized.parentId,
        position: normalized.position ?? existing.position,
      },
    });
  }

  async deleteMenuItem(storeId: string, tenantId: string, menuId: string, itemId: string) {
    const existing = await this.prisma.cmsMenuItem.findFirst({
      where: { id: itemId, tenantId, storeId, menuId },
    });
    if (!existing) return null;
    await this.prisma.cmsMenuItem.delete({ where: { id: itemId } });
    return existing;
  }

  async reorderMenuItems(
    storeId: string,
    tenantId: string,
    menuId: string,
    payload: CmsMenuItemReorderPayload,
  ) {
    await this.ensureMenuExists(storeId, tenantId, menuId);

    const seen = new Map<string | null, Set<number>>();
    for (const item of payload.items) {
      const key = item.parentId ?? null;
      if (!seen.has(key)) seen.set(key, new Set());
      const set = seen.get(key)!;
      if (set.has(item.position)) {
        throw new BadRequestException('Duplicate positions for menu items');
      }
      set.add(item.position);
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of payload.items) {
        const existing = await tx.cmsMenuItem.findFirst({
          where: { id: item.id, tenantId, storeId, menuId },
        });
        if (!existing) {
          throw new NotFoundException('Menu item not found');
        }
        await tx.cmsMenuItem.update({
          where: { id: item.id },
          data: {
            parentId: item.parentId ?? null,
            position: item.position,
          },
        });
      }

      const items = await tx.cmsMenuItem.findMany({
        where: { menuId, tenantId, storeId },
        orderBy: { position: 'asc' },
      });
      return this.buildMenuTree(items);
    });
  }

  async listCollections(storeId: string, tenantId: string): Promise<CmsCollectionSummary[]> {
    const collections = await this.prisma.collection.findMany({
      where: { tenantId, storeId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    return collections.map((collection) => ({
      id: collection.id,
      name: collection.title,
      productCount: collection._count.products ?? 0,
      image: null,
    }));
  }

  private resolveAssetKind(mimeType: string) {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    return 'FILE';
  }

  private normalizeMenuItemPayload(payload: CmsMenuItemCreatePayload) {
    const type = payload.type?.toUpperCase() ?? 'URL';
    const label = payload.label?.trim();
    if (!label) {
      throw new BadRequestException('Label is required');
    }

    if (type === 'URL') {
      const href = payload.href?.trim();
      if (!href) {
        throw new BadRequestException('href is required for URL menu item');
      }
      return {
        ...payload,
        label,
        type,
        href,
        pageId: null,
        parentId: payload.parentId ?? null,
      };
    }

    if (type === 'INTERNAL_PAGE') {
      if (!payload.pageId) {
        throw new BadRequestException('pageId is required for INTERNAL_PAGE menu item');
      }
      return {
        ...payload,
        label,
        type,
        href: payload.href?.trim() || null,
        pageId: payload.pageId,
        parentId: payload.parentId ?? null,
      };
    }

    throw new BadRequestException('Invalid menu item type');
  }

  private async ensureMenuExists(storeId: string, tenantId: string, menuId: string) {
    const menu = await this.prisma.cmsMenu.findFirst({
      where: { id: menuId, tenantId, storeId },
    });
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
  }

  private async ensureMenuItemParent(
    storeId: string,
    tenantId: string,
    menuId: string,
    parentId: string | null,
    itemId?: string,
  ) {
    if (!parentId) return;
    if (parentId === itemId) {
      throw new BadRequestException('Menu item cannot be its own parent');
    }
    const parent = await this.prisma.cmsMenuItem.findFirst({
      where: { id: parentId, tenantId, storeId, menuId },
    });
    if (!parent) {
      throw new BadRequestException('Parent item not found in menu');
    }
  }

  private buildMenuTree(items: Array<any>) {
    const map = new Map<string, any>();
    const roots: any[] = [];

    for (const item of items) {
      map.set(item.id, { ...item, children: [] });
    }

    for (const item of items) {
      const entry = map.get(item.id);
      if (item.parentId) {
        const parent = map.get(item.parentId);
        if (parent) {
          parent.children.push(entry);
        } else {
          roots.push(entry);
        }
      } else {
        roots.push(entry);
      }
    }

    const sortTree = (nodes: any[]) => {
      nodes.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      nodes.forEach((node) => sortTree(node.children));
    };
    sortTree(roots);

    return roots;
  }
}
