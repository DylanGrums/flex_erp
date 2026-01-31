import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

import {
  CmsAssetCreatePayload,
  CmsMenuCreatePayload,
  CmsMenuItemCreatePayload,
  CmsMenuItemReorderPayload,
  CmsMenuItemUpdatePayload,
  CmsMenuUpdatePayload,
  CmsPageCreatePayload,
  CmsPagePublishPayload,
  CmsPageUpdatePayload,
  CmsPageVersionCreatePayload,
  CmsSiteCreatePayload,
  CmsSiteUpdatePayload,
  CmsService,
} from './cms.service';

@UseGuards(AuthGuard('jwt'))
@Controller('cms')
export class CmsController {
  constructor(private readonly cms: CmsService) {}

  @Get('sites/current')
  async getCurrentSite(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    return this.cms.getCurrentSite(storeId!, tenantId!);
  }

  @Get('sites')
  async listSites(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    return this.cms.listSites(storeId!, tenantId!);
  }

  @Post('sites')
  async createSite(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: CmsSiteCreatePayload,
  ) {
    this.requireContext(storeId, tenantId);
    if (!payload?.name?.trim()) {
      throw new BadRequestException('Name is required');
    }
    return this.cms.createSite(storeId!, tenantId!, payload);
  }

  @Patch('sites/:id')
  async updateSite(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: CmsSiteUpdatePayload,
  ) {
    this.requireContext(storeId, tenantId);
    const site = await this.cms.updateSite(storeId!, tenantId!, id, payload);
    if (!site) throw new NotFoundException('Site not found');
    return site;
  }

  @Get('pages')
  async listPages(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('siteId') siteId: string | undefined,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('direction') direction?: 'asc' | 'desc',
    @Query('slug') slug?: string,
  ) {
    this.requireContext(storeId, tenantId);
    if (!siteId) throw new BadRequestException('siteId is required');
    return this.cms.listPages(storeId!, tenantId!, {
      siteId,
      status: status ?? null,
      search: search ?? null,
      sort: sort ?? null,
      direction: direction ?? null,
      slug: slug ?? null,
    });
  }

  @Get('pages/:id')
  async getPageById(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    const page = await this.cms.getPageById(storeId!, tenantId!, id);
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  @Post('pages')
  async createPage(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: CmsPageCreatePayload,
  ) {
    this.requireContext(storeId, tenantId);
    if (!payload?.siteId) {
      throw new BadRequestException('siteId is required');
    }
    if (!payload?.slug?.trim()) {
      throw new BadRequestException('Slug is required');
    }
    if (!payload?.title?.trim()) {
      throw new BadRequestException('Title is required');
    }
    try {
      return await this.cms.createPage(storeId!, tenantId!, payload);
    } catch (err: any) {
      this.handleUniqueError(err, 'Page slug already exists');
      throw err;
    }
  }

  @Patch('pages/:id')
  async updatePage(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: CmsPageUpdatePayload,
  ) {
    this.requireContext(storeId, tenantId);
    if (payload?.slug !== undefined && !payload.slug?.trim()) {
      throw new BadRequestException('Slug is required');
    }
    if (payload?.title !== undefined && !payload.title?.trim()) {
      throw new BadRequestException('Title is required');
    }
    try {
      const page = await this.cms.updatePage(storeId!, tenantId!, id, payload);
      if (!page) throw new NotFoundException('Page not found');
      return page;
    } catch (err: any) {
      this.handleUniqueError(err, 'Page slug already exists');
      throw err;
    }
  }

  @Post('pages/:id/publish')
  async publishPage(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: CmsPagePublishPayload,
  ) {
    this.requireContext(storeId, tenantId);
    const page = await this.cms.publishPage(
      storeId!,
      tenantId!,
      id,
      payload?.versionId ?? null,
    );
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  @Post('pages/:id/unpublish')
  async unpublishPage(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    const page = await this.cms.unpublishPage(storeId!, tenantId!, id);
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  @Get('pages/:pageId/versions')
  async listPageVersions(
    @Param('pageId') pageId: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    return this.cms.listPageVersions(storeId!, tenantId!, pageId);
  }

  @Post('pages/:pageId/versions')
  async createPageVersion(
    @Param('pageId') pageId: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: CmsPageVersionCreatePayload,
  ) {
    this.requireContext(storeId, tenantId);
    if (payload?.content === undefined) {
      throw new BadRequestException('content is required');
    }
    return this.cms.createPageVersion(storeId!, tenantId!, pageId, payload);
  }

  @Get('page-versions/:id')
  async getPageVersionById(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    const version = await this.cms.getPageVersionById(storeId!, tenantId!, id);
    if (!version) throw new NotFoundException('Page version not found');
    return version;
  }

  @Post('page-versions/:id/restore')
  async restorePageVersion(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    const version = await this.cms.restorePageVersion(storeId!, tenantId!, id);
    if (!version) throw new NotFoundException('Page version not found');
    return version;
  }

  @Get('assets')
  async listAssets(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('siteId') siteId?: string,
    @Query('kind') kind?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    this.requireContext(storeId, tenantId);
    return this.cms.listAssets(storeId!, tenantId!, {
      siteId: siteId ?? null,
      kind: kind ?? null,
      skip: this.parseNumber(skip),
      take: this.parseNumber(take),
    });
  }

  @Post('assets')
  async createAsset(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: CmsAssetCreatePayload,
  ) {
    this.requireContext(storeId, tenantId);
    if (!payload?.siteId) throw new BadRequestException('siteId is required');
    if (!payload?.filename) throw new BadRequestException('filename is required');
    if (!payload?.mimeType) throw new BadRequestException('mimeType is required');
    if (!payload?.url) throw new BadRequestException('url is required');
    if (!payload?.kind) throw new BadRequestException('kind is required');
    if (!Number.isFinite(payload?.sizeBytes)) throw new BadRequestException('sizeBytes is required');
    return this.cms.createAsset(storeId!, tenantId!, payload);
  }

  @Delete('assets/:id')
  async deleteAsset(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    const asset = await this.cms.deleteAsset(storeId!, tenantId!, id);
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  @Post('assets/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAsset(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body('siteId') siteId: string | undefined,
    @UploadedFile()
    file?: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ) {
    this.requireContext(storeId, tenantId);
    if (!siteId) throw new BadRequestException('siteId is required');
    if (!file) throw new BadRequestException('file is required');

    const { asset } = await this.cms.saveUpload(storeId!, tenantId!, {
      siteId,
      filename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      buffer: file.buffer,
    });
    return asset;
  }

  @Get('assets/:id/download')
  async downloadAsset(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Res() res: Response,
  ) {
    this.requireContext(storeId, tenantId);
    const result = await this.cms.getAssetDownload(storeId!, tenantId!, id);
    if (!result) throw new NotFoundException('Asset not found');

    res.setHeader('Content-Type', result.asset.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${result.asset.filename}"`);
    return res.sendFile(result.filePath);
  }

  @Get('menus')
  async listMenus(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('siteId') siteId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    if (!siteId) throw new BadRequestException('siteId is required');
    return this.cms.listMenus(storeId!, tenantId!, siteId);
  }

  @Post('menus')
  async createMenu(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: CmsMenuCreatePayload,
  ) {
    this.requireContext(storeId, tenantId);
    if (!payload?.siteId) throw new BadRequestException('siteId is required');
    if (!payload?.key?.trim()) throw new BadRequestException('key is required');
    if (!payload?.title?.trim()) throw new BadRequestException('title is required');
    return this.cms.createMenu(storeId!, tenantId!, payload);
  }

  @Patch('menus/:id')
  async updateMenu(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: CmsMenuUpdatePayload,
  ) {
    this.requireContext(storeId, tenantId);
    const menu = await this.cms.updateMenu(storeId!, tenantId!, id, payload);
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  @Delete('menus/:id')
  async deleteMenu(
    @Param('id') id: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    const menu = await this.cms.deleteMenu(storeId!, tenantId!, id);
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  @Get('menus/:menuId/items')
  async listMenuItems(
    @Param('menuId') menuId: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    return this.cms.listMenuItems(storeId!, tenantId!, menuId);
  }

  @Post('menus/:menuId/items')
  async createMenuItem(
    @Param('menuId') menuId: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: CmsMenuItemCreatePayload,
  ) {
    this.requireContext(storeId, tenantId);
    return this.cms.createMenuItem(storeId!, tenantId!, {
      ...payload,
      menuId,
    });
  }

  @Patch('menus/:menuId/items/:itemId')
  async updateMenuItem(
    @Param('menuId') menuId: string,
    @Param('itemId') itemId: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: CmsMenuItemUpdatePayload,
  ) {
    this.requireContext(storeId, tenantId);
    const item = await this.cms.updateMenuItem(
      storeId!,
      tenantId!,
      menuId,
      itemId,
      payload,
    );
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  @Delete('menus/:menuId/items/:itemId')
  async deleteMenuItem(
    @Param('menuId') menuId: string,
    @Param('itemId') itemId: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    const item = await this.cms.deleteMenuItem(storeId!, tenantId!, menuId, itemId);
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  @Post('menus/:menuId/items/reorder')
  async reorderMenuItems(
    @Param('menuId') menuId: string,
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() payload: CmsMenuItemReorderPayload,
  ) {
    this.requireContext(storeId, tenantId);
    if (!payload?.items?.length) {
      throw new BadRequestException('items are required');
    }
    return this.cms.reorderMenuItems(storeId!, tenantId!, menuId, payload);
  }

  @Get('collections')
  async listCollections(
    @Headers('x-store-id') storeId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.requireContext(storeId, tenantId);
    return this.cms.listCollections(storeId!, tenantId!);
  }

  private requireContext(storeId?: string, tenantId?: string) {
    if (!storeId || !tenantId) {
      throw new UnauthorizedException();
    }
  }

  private parseNumber(value?: string): number | undefined {
    if (!value) return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  }

  private handleUniqueError(err: any, message: string) {
    if (err?.code === 'P2002') {
      throw new ConflictException(message);
    }
  }
}
