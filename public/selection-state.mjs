import {publicProductId,publicVariantId} from './public-identities.mjs';

const opaqueProduct=value=>publicProductId(typeof value==='string'&&value.startsWith('mini-et-moi-cj-')?'cj-'+value.slice('mini-et-moi-cj-'.length):value);
export function exactOption(products,id,variantId){
 const product=products.find(p=>p.id===id);
 const option=product?.variants.find(v=>v.id===variantId);
 return option?{product,option}:null;
}
/** Same local storage key. A historical collection choice never asserted a
 * clothing size: keep it pending instead of silently choosing a default piece. */
export function restoreSelection(value,products){
 if(!Array.isArray(value))throw Error('SELECTION_INVALID');
 const items=[],unresolved=[],seen=new Set();
 for(const raw of value.slice(0,50)){
  const id=typeof raw==='string'?raw:raw?.id;
  if(typeof id!=='string'||id.length>180)continue;
  if(raw&&typeof raw==='object'&&Object.hasOwn(raw,'variantId')&&
    (typeof raw.variantId!=='string'||raw.variantId.length<1||raw.variantId.length>120))throw Error('SELECTION_INVALID');
  const product=products.find(p=>p.id===opaqueProduct(id));
  const variant=typeof raw==='object'&&raw&&typeof raw.variantId==='string'?raw.variantId:undefined;
  const variantId=variant?publicVariantId(variant):null;
  if(!product||!variantId||!exactOption(products,product.id,variantId)){
   unresolved.push({id:product?.id??id,...(variant?{variantId:variant}:{})});continue;
  }
  const key=product.id+'|'+variantId;if(seen.has(key))continue;seen.add(key);
  items.push({id:product.id,variantId});
 }
 return {items,unresolved};
}
export function addSelection(items,products,id,variantId,unresolvedCount=0){
 if(!exactOption(products,id,variantId)||items.length+unresolvedCount>=50||items.some(x=>x.id===id&&x.variantId===variantId))return items;
 return [...items,{id,variantId}];
}
