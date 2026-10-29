import policy from './lib/catalogue-exclusions.json';
import {publicProductId,publicVariantId} from './lib/public-identities.mjs';
const products=new Set(policy.entries.map(entry=>entry.id));
const variants=new Set(policy.entries.flatMap(entry=>entry.variantIds));
export function isCatalogueExcluded(value: unknown): boolean {
 const check=(v:unknown)=>{const id=publicProductId(v),variant=publicVariantId(v),bare=typeof v==='string'?publicProductId('cj-'+v):null;return !!id&&products.has(id)||!!bare&&products.has(bare)||!!variant&&variants.has(variant);};
 if(typeof value==='string')return check(value);
 if(!value||typeof value!=='object')return false;
 const row=value as Record<string,unknown>;
 return ['id','variantId'].some(key=>check(row[key]));
}
