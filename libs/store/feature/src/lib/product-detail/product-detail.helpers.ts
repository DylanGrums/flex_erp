import { ProductDetail, ProductOption, ProductVariantDetail } from '@flex-erp/store/util';
import { ProductUpsertPayload } from '@flex-erp/store/data-access';

const DEFAULT_STATUS = 'DRAFT';
const FALLBACK_OPTION_VALUE = 'Default';

const sortOptions = (options: ProductOption[]): ProductOption[] =>
  [...options].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

const resolveVariantPrice = (variant: ProductVariantDetail): number => {
  if (typeof variant.price === 'number') {
    return variant.price;
  }
  if (typeof variant.priceAmount === 'number') {
    return variant.priceAmount / 100;
  }
  return 0;
};

const buildVariantOptionValues = (
  variant: ProductVariantDetail,
  options: ProductOption[],
  fallbackValue: string,
): string[] =>
  options.map((option) => {
    const match = variant.optionValues?.find(
      (value) => value.optionId === option.id,
    );
    return match?.value ?? fallbackValue;
  });

const buildVariantPayloads = (
  variants: ProductVariantDetail[],
  options: ProductOption[],
  fallbackValue: string,
): ProductUpsertPayload['variants'] =>
  variants.map((variant) => ({
    sku: variant.sku ?? null,
    price: resolveVariantPrice(variant),
    optionValues: buildVariantOptionValues(variant, options, fallbackValue),
  }));

export const buildProductUpsertPayload = (
  detail: ProductDetail,
  overrides: Partial<ProductUpsertPayload> = {},
  fallbackOptionValue = FALLBACK_OPTION_VALUE,
): ProductUpsertPayload => {
  const orderedOptions = sortOptions(detail.options ?? []);
  const baseOptions = orderedOptions.map((option) => option.name);
  const baseVariants = buildVariantPayloads(
    detail.variants ?? [],
    orderedOptions,
    fallbackOptionValue,
  );
  const baseImages = detail.images?.map((image) => image.url) ?? [];

  return {
    title: overrides.title ?? detail.title,
    handle: overrides.handle ?? detail.handle ?? null,
    description: overrides.description ?? detail.description ?? null,
    status: overrides.status ?? detail.status ?? DEFAULT_STATUS,
    options: overrides.options ?? baseOptions,
    variants: overrides.variants ?? baseVariants,
    images: overrides.images ?? baseImages,
  };
};
