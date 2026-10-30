import type {Product, ProductVariant} from './lib/catalogue';
import type {RemoteCatalogue} from './commerce-client';
import type {CartLine} from './cart-state';

/** Every presentation field comes from this exact curated option. Unknown saved
 * options remain unresolved; a different color is never used as a fallback. */
export function productVariants(product:Product, remote:RemoteCatalogue|null=null):ProductVariant[] {
 const curated=product.variants??[{id:product.defaultVariantId,label:'Modèle sélectionné',image:product.image,imageAlt:product.name,priceCents:product.priceCents,priceStatus:'fixed' as const,priceIncludesShipping:false as const,indicativePriceCents:product.priceCents,availableForCheckout:false}];
 const distant=remote?.products.find(p=>p.id===product.id)?.variants;
 return curated.map(option=>({...option,availableForCheckout:distant?.some(v=>v.id===option.id&&v.availableForCheckout)===true}));
}
export function selectedOption(product:Product, variantId:string):ProductVariant|null {
 return productVariants(product).find(option=>option.id===variantId)??null;
}
export function optionPrice(product:Product, variantId:string):number|null {
 const option=selectedOption(product,variantId);
 return option&&Number.isSafeInteger(option.priceCents)&&option.priceCents>0?option.priceCents:null;
}
export function addTrialLine(lines:CartLine[], product:Product, variantId:string, unresolvedCount=0):CartLine[] {
 if(!selectedOption(product,variantId))return lines;
 const existing=lines.find(line=>line.id===product.id&&line.variantId===variantId);
 if(existing)return existing.quantity>=10?lines:lines.map(line=>line===existing?{...line,quantity:line.quantity+1}:line);
 return lines.length+unresolvedCount>=20?lines:[...lines,{id:product.id,variantId,quantity:1}];
}
