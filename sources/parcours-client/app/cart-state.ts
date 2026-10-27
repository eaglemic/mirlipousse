import type {Product} from './lib/catalogue';
export type CartLine={id:string;variantId:string;quantity:number};
export type UnresolvedLine={id:string;variantId?:string;quantity:number};
export function aliases(products:Product[]){const map=new Map<string,Product>();for(const p of products){map.set(p.id,p);map.set('cj-'+p.supplierProductId.toLowerCase(),p);map.set('mirlipousse-cj-'+p.supplierProductId.toLowerCase(),p);}return map;}
export function restoreCart(value:unknown,products:Product[]){
 const known=aliases(products),lines=new Map<string,CartLine>(),unresolved:UnresolvedLine[]=[];
 if(!Array.isArray(value))throw Error('PANIER_INVALIDE');
 for(const raw of value.slice(0,40)){
  if(!raw||typeof raw!=='object'||typeof raw.id!=='string'||raw.id.length>180||!Number.isInteger(raw.quantity)||raw.quantity<1||raw.quantity>10)continue;
  const p=known.get(raw.id);const variantId=typeof raw.variantId==='string'&&raw.variantId.length<=120?raw.variantId:p?.supplierVariantId;
  if(!p||!variantId){unresolved.push({id:raw.id,...(variantId?{variantId}:{}),quantity:raw.quantity});continue;}
  const key=p.id+'|'+variantId;const before=lines.get(key);lines.set(key,{id:p.id,variantId,quantity:Math.min(10,(before?.quantity||0)+raw.quantity)});
 }
 return {lines:[...lines.values()],unresolved};
}
