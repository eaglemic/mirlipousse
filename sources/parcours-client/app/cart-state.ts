import type {Product} from './lib/catalogue';
import {isCatalogueExcluded} from './catalogue-exclusions';
import {publicProductId,publicVariantId} from './lib/public-identities.mjs';
export type CartLine={id:string;variantId:string;quantity:number};
export type UnresolvedLine={id:string;variantId?:string;quantity:number};
class ProductMap extends Map<string,Product>{get(key:string){return super.get(publicProductId(key)||key);}}
export function aliases(products:Product[]){const map=new ProductMap();for(const p of products)map.set(p.id,p);return map;}
export function restoreCart(value:unknown,products:Product[]){
 const known=aliases(products),lines=new Map<string,CartLine>(),originalKeys=new Map<string,string>(),unresolved:UnresolvedLine[]=[];
 if(!Array.isArray(value))throw Error('PANIER_INVALIDE');
 for(const raw of value.slice(0,40)){
  if(!raw||typeof raw!=='object'||typeof raw.id!=='string'||raw.id.length>180||!Number.isInteger(raw.quantity)||raw.quantity<1||raw.quantity>10)continue;
  if(isCatalogueExcluded(raw))continue;
  const p=known.get(raw.id);const rawVariant=typeof raw.variantId==='string'&&raw.variantId.length<=120?raw.variantId:undefined;const migrated=rawVariant?publicVariantId(rawVariant):null;const knownVariant=migrated&&(p?.defaultVariantId===migrated||p?.variants?.some(v=>v.id===migrated));const variantId=rawVariant?(knownVariant?migrated!:rawVariant):p?.defaultVariantId;
  if(!p||!variantId){unresolved.push({id:raw.id,...(variantId?{variantId}:{}),quantity:raw.quantity});continue;}
  const key=p.id+'|'+variantId,original=raw.id+'|'+(rawVariant||'');if(originalKeys.has(key)&&originalKeys.get(key)!==original)throw Error('PANIER_ALIAS_CONFLICT');originalKeys.set(key,original);const before=lines.get(key);lines.set(key,{id:p.id,variantId,quantity:Math.min(10,(before?.quantity||0)+raw.quantity)});
 }
 return {lines:[...lines.values()],unresolved};
}
export function restoreFavorites(value:unknown,products:Product[]){
 if(!Array.isArray(value))return [];
 const known=aliases(products);
 return [...new Set(value.filter((id:unknown):id is string=>typeof id==='string'&&!isCatalogueExcluded(id)).map(id=>known.get(id)?.id||id))].slice(0,40);
}
