import policy from './lib/catalogue-exclusions.json';

const excluded = new Set(policy.entries.flatMap(entry => [
  entry.supplierProductId, ...entry.supplierVariantIds,
  entry.supplierProductSku, ...entry.supplierVariantSkus, ...entry.aliases,
]).map(value => value.toLowerCase()));

export function isCatalogueExcluded(value: unknown): boolean {
  if (typeof value === 'string') return excluded.has(value.toLowerCase());
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return ['id', 'pid', 'vid', 'supplierProductId', 'supplierVariantId', 'variantId', 'sku', 'productSku', 'variantSku', 'supplierProductSku', 'supplierVariantSku']
    .some(key => typeof row[key] === 'string' && excluded.has((row[key] as string).toLowerCase()));
}
