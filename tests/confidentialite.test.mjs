import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {restoreSelection,addSelection,exactOption,groupVariantOptions} from '../public/selection-state.mjs';
import {publicProductId,publicVariantId} from '../public/public-identities.mjs';

const catalogue=JSON.parse(readFileSync(new URL('../public/catalogue.json',import.meta.url)));
const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
function redirected(pathname,products=catalogue.products){
 const destinations=[];let storageReads=0,storageWrites=0;
 const config={...catalogue,products};
 const document={getElementById:id=>id==='brand-data'?{textContent:JSON.stringify(config)}:null,
  documentElement:{dataset:{motionStudio:'fixture'}},body:{classList:{add(){throw Error('unexpected rendering');}}}};
 const context=vm.createContext({document,location:{pathname,replace:path=>destinations.push(path)},
  restoreSelection,addSelection,exactOption,groupVariantOptions,Map,Set,WeakSet,JSON,Error,
  localStorage:{getItem(){storageReads++;throw Error('unexpected read');},setItem(){storageWrites++;throw Error('unexpected write');}}});
 vm.runInContext(source.slice(source.indexOf('\n')+1),context);
 return {destinations,storageReads,storageWrites};
}
test('Ancien lien connu : destination opaque locale, sans écriture de sélection',()=>{
 const raw='fixture-collection-locale',products=catalogue.products.map((p,i)=>i===0?{...p,id:publicProductId('cj-'+raw)}:p);
 const result=redirected('/produits/mini-et-moi-cj-'+raw+'.html',products);
 assert.deepEqual(result,{destinations:['/produits/'+products[0].id+'.html'],storageReads:0,storageWrites:0});
});
test('Ancien lien retiré : duos locaux, aucun renvoi vers un domaine tiers',()=>{
 const result=redirected('/produits/mini-et-moi-cj-fixture-retiree.html');
 assert.deepEqual(result,{destinations:['/duos.html'],storageReads:0,storageWrites:0});
});
test('Ancien panier avec taille : identités migrées, sans substitution et sans perdre les inconnus',()=>{
 const rawProduct='fixture-duo',rawVariant='fixture-taille-exacte',p=catalogue.products[0];
 const fake={...p,id:publicProductId('cj-'+rawProduct),variants:[{...p.variants[0],id:publicVariantId(rawVariant)}]};
 const saved=[{id:'mini-et-moi-cj-'+rawProduct,variantId:rawVariant},{id:'ancien-inconnu',variantId:'taille-inconnue'}];
 const before=JSON.stringify(saved),result=restoreSelection(saved,[fake]);
 assert.deepEqual(result.items,[{id:fake.id,variantId:fake.variants[0].id}]);
 assert.deepEqual(result.unresolved,[saved[1]]);assert.equal(JSON.stringify(saved),before);
});
test('Sources privées absentes du paquet, catalogue et attestation opaques et commerce fermé',()=>{
 const att=JSON.parse(readFileSync(new URL('../verification/ATTESTATION-CATALOGUE.json',import.meta.url)));
 assert.equal(att.salesEnabled,false);assert.equal(att.qualificationCommerciale,false);
 assert.equal(att.products.length,3);assert.equal(catalogue.salesEnabled,false);
 for(const p of att.products){assert.match(p.id,/^mm-p-[a-f0-9]{64}$/);assert(p.childVariantIds.length&&p.adultVariantIds.length);assert(p.options.every(v=>/^mm-v-[a-f0-9]{64}$/.test(v.id)));}
 for(const name of ['pid','vid','supplierRole','supplierSize','sourceText','sourcePath','sourceLocal'])assert(!new RegExp('"'+name+'"\\s*:').test(JSON.stringify(att)));
});
