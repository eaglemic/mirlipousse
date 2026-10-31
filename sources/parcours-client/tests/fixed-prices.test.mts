import test from 'node:test';
import assert from 'node:assert/strict';
import {products} from '../app/lib/catalogue.ts';
import {optionPrice} from '../app/variant-selection.ts';
import {readCatalogue,CommerceError} from '../app/commerce-client.ts';
import {matchesAge,ageCoverageLabel,countAges} from '../app/age-groups.ts';

test('30 prix articles et199 prix variantes fixes, panier et sélection identiques sans paiement',()=>{
  let count=0;
  for(const p of products){
    assert(Number.isSafeInteger(p.priceCents)&&p.priceCents>0);assert.equal(p.priceStatus,'fixed');assert.equal(p.priceIncludesShipping,false);
    assert.equal(p.priceCents,p.variants!.find(v=>v.id===p.defaultVariantId)!.priceCents);
    for(const v of p.variants!){count++;assert(v.priceCents>0);assert.equal(v.priceStatus,'fixed');assert.equal(v.priceIncludesShipping,false);assert.equal(v.indicativePriceCents,v.priceCents);assert.equal(optionPrice(p,v.id),v.priceCents);assert.equal(v.availableForCheckout,false);}
  }
  assert.equal(products.length,30);assert.equal(count,199);assert.equal(Math.min(...products.map(p=>p.priceCents)),490);assert.equal(Math.max(...products.map(p=>p.priceCents)),3090);
});
test('le lecteur API refuse prix0/manquant, pseudo prixfixe, livraison incluse ou alias divergent',()=>{
  const catalogue={ok:true,brand:'mirlipousse',salesEnabled:false,products:products.map(p=>({id:p.id,variants:p.variants})),deliveryMethods:[]};
  assert.equal(readCatalogue(catalogue).products.length,30);
  for(const patch of [{priceCents:0},{priceCents:null},{priceCents:undefined},{priceCents:-1},{priceCents:1.5},{priceStatus:'indicatif'},{priceIncludesShipping:true},{indicativePriceCents:1}]){
    const value=structuredClone(catalogue);Object.assign(value.products[0].variants![0],patch);assert.throws(()=>readCatalogue(value),CommerceError);
  }
});
test('satellite unique à4,90€, filtre9–12 exact sur âge7–14 déclaré sans qualification sécurité',()=>{
  const satellite=products.find(p=>p.name==='Satellite solaire en bois à assembler')!;assert(satellite);
  assert.equal(satellite.priceCents,490);assert.equal(satellite.variants!.length,1);assert.equal(satellite.variants![0].priceCents,490);
  assert.equal(satellite.variants![0].availableForCheckout,false);assert.equal(satellite.ageEvidenceStatus,'supplier_stated_unverified');
  assert.equal(satellite.ageLabel,'7–14 ans');assert.equal(matchesAge(satellite,'9-12'),true);assert.equal(matchesAge(satellite,'6-8'),true);
  assert.equal(matchesAge(satellite,'3-5'),false);assert.equal(matchesAge(satellite,'0-2'),false);
  assert.equal(ageCoverageLabel(satellite,'6-8'),'Dans cette tranche : 7–8 ans');assert.equal(ageCoverageLabel(satellite,'9-12'),'');
  assert.deepEqual(countAges(products),{tout:30,'age-inconnu':24,'0-2':1,'3-5':4,'6-8':6,'9-12':3});
});
