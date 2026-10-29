import test from 'node:test';
import assert from 'node:assert/strict';
import {products} from '../app/lib/catalogue.ts';
import {restoreCart,restoreFavorites} from '../app/cart-state.ts';
import {selectedOption,productVariants,optionPrice,addTrialLine} from '../app/variant-selection.ts';
import {readCatalogue,readQuote,canPrepareCheckout,CommerceError} from '../app/commerce-client.ts';

const bag=products.find(p=>p.name==='Sac à dos léger à motif pour enfant')!;
const [first,second]=bag.variants!;
const publicCatalogue=()=>({ok:true,brand:'mirlipousse',salesEnabled:false,products:products.map(p=>({id:p.id,variants:p.variants})),deliveryMethods:[{mode:'home',service:'standard',countries:['FR','BE'],availableForPreview:true,qualifiedForCheckout:false}]});
test('30 produits uniques,204 variantes imbriquées et5 vrais coloris du sac',()=>{
 assert.equal(products.length,30);assert.equal(new Set(products.map(p=>p.id)).size,30);
 assert.equal(products.reduce((n,p)=>n+p.variants!.length,0),204);
 assert.equal(bag.variants!.length,5);assert.equal(new Set(bag.variants!.map(v=>v.image)).size,5);
 for(const p of products){assert(p.variants!.some(v=>v.id===p.defaultVariantId));for(const v of p.variants!){assert.match(v.id,/^mm-v-[a-f0-9]{64}$/);assert.match(v.image!,/^\/media\/variantes\/image-[a-f0-9]{24}\.(jpg|png)$/);assert.equal(v.availableForCheckout,false);}}
});
test('Chaque sélection conserve sa photo, son libellé et son prix propre',()=>{
 for(const option of bag.variants!){const chosen=selectedOption(bag,option.id)!;assert.equal(chosen.image,option.image);assert.equal(chosen.label,option.label);assert.equal(optionPrice(bag,option.id),option.id===bag.defaultVariantId?bag.indicativePriceCents:null);}
 const nonDefault=bag.variants!.find(v=>v.id!==bag.defaultVariantId)!;
 assert.equal(optionPrice({...bag,indicativePriceCents:12345},nonDefault.id),null);
 assert.equal(selectedOption(bag,products[0].defaultVariantId),null);assert.equal(selectedOption(bag,'ancienne-inconnue'),null);
 assert.deepEqual(addTrialLine([],bag,products[0].defaultVariantId),[]);
});
test('Deux couleurs du même article restent deux lignes après relecture, avec favoris préservés',()=>{
 let lines=addTrialLine([],bag,first.id);lines=addTrialLine(lines,bag,second.id);
 assert.equal(lines.length,2);assert.notEqual(selectedOption(bag,lines[0].variantId)!.image,selectedOption(bag,lines[1].variantId)!.image);
 assert.deepEqual(restoreCart(JSON.parse(JSON.stringify(lines)),products).lines,lines);
 assert.deepEqual(restoreFavorites([bag.id,products[0].id],products),[bag.id,products[0].id]);
 assert.deepEqual(restoreCart([{id:bag.id,quantity:2}],products).lines,[{id:bag.id,variantId:bag.defaultVariantId,quantity:2}]);
 const old=restoreCart([{id:bag.id,variantId:'ancienne-couleur',quantity:3}],products).lines[0];assert.equal(old.variantId,'ancienne-couleur');assert.equal(selectedOption(bag,old.variantId),null);
 for(const variantId of ['',null,0,{},'x'.repeat(121)])assert.throws(()=>restoreCart([{id:bag.id,variantId,quantity:1}],products),/PANIER_VARIANTE_INVALIDE/);
});
test('Ajouts répétés et rapides gardent10 unités et20 lignes sans changer de couleur',()=>{
 let lines:ReturnType<typeof addTrialLine>=[];for(let i=0;i<20;i++)lines=addTrialLine(lines,bag,first.id);
 assert.equal(lines.length,1);assert.equal(lines[0].quantity,10);lines=addTrialLine(lines,bag,second.id);assert.equal(lines[1].quantity,1);
 const full=products.flatMap(p=>p.variants!.map(v=>({id:p.id,variantId:v.id,quantity:1}))).slice(0,20);
 const candidate=products.flatMap(p=>p.variants!.map(v=>({p,v}))).find(({p,v})=>!full.some(l=>l.id===p.id&&l.variantId===v.id))!;
 assert.equal(addTrialLine(full,candidate.p,candidate.v.id),full);
 assert.equal(addTrialLine([],bag,first.id,20).length,0);
});
test('Catalogue distant valide les options opaques sans doubler produit ou variante',()=>{
 assert.equal(readCatalogue(publicCatalogue()).products.length,30);
 for(const transform of [
  (x:any)=>x.products.push(x.products[0]),
  (x:any)=>x.products[0].variants.push(x.products[0].variants[0]),
  (x:any)=>x.products[1].variants.push(x.products[0].variants[0]),
  (x:any)=>x.products[0].variants[0].image='https://external.invalid/photo.jpg',
  (x:any)=>x.products[0].variants[0].image='/media/variantes/../secret',
  (x:any)=>x.products[0].variants[0].indicativePriceCents=-1,
 ]){const value=structuredClone(publicCatalogue());transform(value);assert.throws(()=>readCatalogue(value),CommerceError);}
});
test('Le devis ne peut remplacer une couleur par une seconde ligne de l’autre',()=>{
 const items=[{id:bag.id,variantId:first.id,quantity:1},{id:bag.id,variantId:second.id,quantity:2}];
 const quote={ok:true,salesEnabled:false,previewOnly:true,canPrepareCheckout:false,country:'FR',currency:'EUR',subtotalIndicativeCents:null,shippingIndicativeCents:null,totalIndicativeCents:null,delivery:{mode:'home',service:'standard',qualifiedForCheckout:false,availableForPreview:true},items:items.map(i=>({...i,unitIndicativeCents:null,lineIndicativeCents:null}))};
 assert.equal(readQuote(quote,'FR','home',items).previewOnly,true);
 for(const body of [{...quote,items:[quote.items[0],quote.items[0]]},{...quote,items:[quote.items[0],{...quote.items[1],variantId:products[0].defaultVariantId}]},{...quote,items:[quote.items[0],{...quote.items[1],unitIndicativeCents:100,lineIndicativeCents:100}]}])assert.throws(()=>readQuote(body,'FR','home',items),CommerceError);
 assert.equal(canPrepareCheckout(readCatalogue(publicCatalogue()),quote as any,items,'FR'),false);
 assert(productVariants(bag,readCatalogue(publicCatalogue())).every(v=>v.availableForCheckout===false));
});
