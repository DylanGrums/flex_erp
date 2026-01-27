import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';

export type ProductCreatePayload = {
  title: string;
  handle: string | null;
  description?: string | null;
  status: string;
  options: string[];
  variants: Array<{
    sku: string | null;
    price: number;
    optionValues: string[];
  }>;
  images: string[];
};

export type ProductUpdatePayload = Partial<ProductCreatePayload>;

type ProductDto = {
  id: string;
  title: string;
  handle: string | null;
  description?: string | null;
  status: string;
  options: string[];
  variants: Array<{
    id: string;
    sku: string | null;
    price: number;
    optionValues: string[];
  }>;
  images: string[];
};

type ProductDetailDto = {
  id: string;
  title: string;
  handle: string | null;
  description: string | null;
  status: string;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    position: number;
  }>;
  options: Array<{
    id: string;
    name: string;
    position: number;
    values: Array<{
      id: string;
      value: string;
      position: number;
    }>;
  }>;
  variants: Array<{
    id: string;
    title: string;
    sku: string | null;
    priceAmount: number;
    price: number;
    inventoryQuantity: number;
    allowBackorder: boolean;
    position: number;
    optionValues: Array<{
      id: string;
      value: string;
      optionId: string;
      optionName: string | null;
    }>;
  }>;
  collections: Array<{
    id: string;
    title: string;
    handle: string;
    description: string | null;
  }>;
};

@Injectable()
export class ProductsService implements OnModuleInit {
  private prisma = new (PrismaClient as any)({
    adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }),
  }) as any;

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async list(storeId: string, tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { storeId, tenantId },
      select: { id: true, title: true, handle: true, status: true },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product: any) => ({
      ...product,
      status: product.status,
    }));
  }

  async getById(storeId: string, id: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, storeId, tenantId },
      include: {
        images: { orderBy: { position: 'asc' } },
        options: {
          orderBy: { position: 'asc' },
          include: { values: { orderBy: { position: 'asc' } } },
        },
        variants: {
          orderBy: { position: 'asc' },
          include: {
            optionValues: {
              include: { optionValue: { include: { option: true } } },
            },
          },
        },
        collections: { include: { collection: true } },
      },
    });

    if (!product) return null;
    return this.toDetailDto(product);
  }

  async create(
    storeId: string,
    tenantId: string,
    payload: ProductCreatePayload,
  ) {
    const handle = payload.handle?.trim() || this.slugify(payload.title);
    const normalized = this.normalizePayload(payload);

    return this.prisma.$transaction(async (tx: any) => {
      const product = await tx.product.create({
        data: {
          tenantId,
          storeId,
          title: normalized.title,
          handle,
          description: normalized.description ?? null,
          status: normalized.status ?? 'DRAFT',
        },
      });

      const optionRecords = await this.createOptions(
        tx,
        product.id,
        tenantId,
        storeId,
        normalized.options,
      );
      const optionValueMap = await this.createOptionValues(
        tx,
        tenantId,
        storeId,
        optionRecords,
        normalized.variants,
      );

      await this.createVariants(
        tx,
        product.id,
        tenantId,
        storeId,
        normalized.variants,
        optionValueMap,
      );

      await this.createImages(
        tx,
        product.id,
        tenantId,
        storeId,
        normalized.images,
      );

      const created = await tx.product.findFirst({
        where: { id: product.id, tenantId, storeId },
        include: {
          images: { orderBy: { position: 'asc' } },
          options: {
            orderBy: { position: 'asc' },
            include: { values: { orderBy: { position: 'asc' } } },
          },
          variants: {
            orderBy: { position: 'asc' },
            include: { optionValues: { include: { optionValue: true } } },
          },
        },
      });

      if (!created) return null;
      return this.toDto(created);
    });
  }

  async update(
    storeId: string,
    id: string,
    tenantId: string,
    payload: ProductUpdatePayload,
  ) {
    const normalized = this.normalizePayload(payload);
    const handle =
      payload.title && !payload.handle
        ? this.slugify(payload.title)
        : (payload.handle ?? null);

    return this.prisma.$transaction(async (tx: any) => {
      const existing = await tx.product.findFirst({
        where: { id, tenantId, storeId },
      });
      if (!existing) return null;

      await tx.product.update({
        where: { id },
        data: {
          title: normalized.title ?? existing.title,
          handle: handle ?? existing.handle,
          description: normalized.description ?? existing.description,
          status: normalized.status ?? existing.status,
        },
      });

      await tx.productImage.deleteMany({
        where: { tenantId, storeId, productId: id },
      });
      await tx.productVariant.deleteMany({
        where: { tenantId, storeId, productId: id },
      });
      await tx.productOption.deleteMany({
        where: { tenantId, storeId, productId: id },
      });

      const optionRecords = await this.createOptions(
        tx,
        id,
        tenantId,
        storeId,
        normalized.options ?? [],
      );
      const optionValueMap = await this.createOptionValues(
        tx,
        tenantId,
        storeId,
        optionRecords,
        normalized.variants ?? [],
      );

      await this.createVariants(
        tx,
        id,
        tenantId,
        storeId,
        normalized.variants ?? [],
        optionValueMap,
      );

      await this.createImages(
        tx,
        id,
        tenantId,
        storeId,
        normalized.images ?? [],
      );

      const updated = await tx.product.findFirst({
        where: { id, tenantId, storeId },
        include: {
          images: { orderBy: { position: 'asc' } },
          options: {
            orderBy: { position: 'asc' },
            include: { values: { orderBy: { position: 'asc' } } },
          },
          variants: {
            orderBy: { position: 'asc' },
            include: { optionValues: { include: { optionValue: true } } },
          },
        },
      });

      if (!updated) return null;
      return this.toDto(updated);
    });
  }

  private normalizePayload<T extends ProductUpdatePayload>(payload: T) {
    const title = payload.title?.trim();
    const description =
      payload.description !== undefined
        ? payload.description?.trim() || null
        : undefined;
    const status = payload.status?.toUpperCase();
    const options = payload.options
      ?.filter(Boolean)
      .map((option) => option.trim());
    const variants = payload.variants?.map((variant) => ({
      sku: variant.sku?.trim() || null,
      price: Number.isFinite(variant.price) ? variant.price : 0,
      optionValues:
        variant.optionValues?.map((value) => value.trim()).filter(Boolean) ??
        [],
    }));
    const images = payload.images?.map((url) => url.trim()).filter(Boolean);
    return {
      ...payload,
      title,
      description,
      status,
      options,
      variants,
      images,
    };
  }

  private async createOptions(
    tx: any,
    productId: string,
    tenantId: string,
    storeId: string,
    options: string[],
  ) {
    const records = [] as Array<{ id: string; name: string; position: number }>;
    for (const [index, name] of options.entries()) {
      const record = await tx.productOption.create({
        data: {
          tenantId,
          storeId,
          productId,
          name,
          position: index,
        },
      });
      records.push(record);
    }
    return records;
  }

  private async createOptionValues(
    tx: any,
    tenantId: string,
    storeId: string,
    options: Array<{ id: string; name: string; position: number }>,
    variants: Array<{ optionValues: string[] }>,
  ) {
    const map = new Map<string, Map<string, string>>();
    for (const option of options) {
      const values = new Map<string, string>();
      const uniqueValues = new Set(
        variants
          .map((variant) => variant.optionValues[option.position])
          .filter(Boolean),
      );
      let position = 0;
      for (const value of uniqueValues) {
        const created = await tx.productOptionValue.create({
          data: {
            tenantId,
            storeId,
            optionId: option.id,
            value,
            position,
          },
        });
        values.set(value, created.id);
        position += 1;
      }
      map.set(option.id, values);
    }
    return map;
  }

  private async createVariants(
    tx: any,
    productId: string,
    tenantId: string,
    storeId: string,
    variants: Array<{
      sku: string | null;
      price: number;
      optionValues: string[];
    }>,
    optionValueMap: Map<string, Map<string, string>>,
  ) {
    let position = 0;
    const optionIds = Array.from(optionValueMap.keys());
    for (const variant of variants) {
      const created = await tx.productVariant.create({
        data: {
          tenantId,
          storeId,
          productId,
          title: variant.sku ?? 'Variant',
          sku: variant.sku,
          priceAmount: Math.round((variant.price ?? 0) * 100),
          position,
        },
      });

      for (const [optionIndex, value] of variant.optionValues.entries()) {
        const optionId = optionIds[optionIndex];
        if (!optionId || !value) continue;
        const optionValueId = optionValueMap.get(optionId)?.get(value);
        if (!optionValueId) continue;
        await tx.variantOptionValue.create({
          data: {
            tenantId,
            storeId,
            variantId: created.id,
            optionValueId,
          },
        });
      }

      position += 1;
    }
  }

  private async createImages(
    tx: any,
    productId: string,
    tenantId: string,
    storeId: string,
    images: string[],
  ) {
    let position = 0;
    for (const url of images) {
      await tx.productImage.create({
        data: {
          tenantId,
          storeId,
          productId,
          url,
          position,
        },
      });
      position += 1;
    }
  }

  private toDto(product: any): ProductDto {
    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description ?? null,
      status: product.status,
      options: product.options?.map((option: any) => option.name) ?? [],
      images: product.images?.map((image: any) => image.url) ?? [],
      variants:
        product.variants?.map((variant: any) => ({
          id: variant.id,
          sku: variant.sku,
          price: variant.priceAmount ? variant.priceAmount / 100 : 0,
          optionValues:
            variant.optionValues?.map((item: any) => item.optionValue?.value) ??
            [],
        })) ?? [],
    };
  }

  private toDetailDto(product: any): ProductDetailDto {
    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description ?? null,
      status: product.status,
      images:
        product.images?.map((image: any) => ({
          id: image.id,
          url: image.url,
          alt: image.alt ?? null,
          position: image.position ?? 0,
        })) ?? [],
      options:
        product.options?.map((option: any) => ({
          id: option.id,
          name: option.name,
          position: option.position ?? 0,
          values:
            option.values?.map((value: any) => ({
              id: value.id,
              value: value.value,
              position: value.position ?? 0,
            })) ?? [],
        })) ?? [],
      variants:
        product.variants?.map((variant: any) => ({
          id: variant.id,
          title: variant.title,
          sku: variant.sku,
          priceAmount: variant.priceAmount ?? 0,
          price: variant.priceAmount ? variant.priceAmount / 100 : 0,
          inventoryQuantity: variant.inventoryQuantity ?? 0,
          allowBackorder: variant.allowBackorder ?? false,
          position: variant.position ?? 0,
          optionValues:
            variant.optionValues?.map((item: any) => ({
              id: item.optionValue?.id ?? item.optionValueId,
              value: item.optionValue?.value ?? '',
              optionId: item.optionValue?.optionId ?? '',
              optionName: item.optionValue?.option?.name ?? null,
            })) ?? [],
        })) ?? [],
      collections:
        product.collections?.map((link: any) => ({
          id: link.collection?.id ?? link.collectionId,
          title: link.collection?.title ?? '',
          handle: link.collection?.handle ?? '',
          description: link.collection?.description ?? null,
        })) ?? [],
    };
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
