import test from 'node:test';
import assert from 'node:assert/strict';
import {isCatalogueExcluded} from '../app/catalogue-exclusions.ts';
import {restoreCart,restoreFavorites} from '../app/cart-state.ts';
import {products} from '../app/lib/catalogue.ts';

const pid='2406200657031625700',vid='2406200657031625900';
const aliases=[pid,vid,'cj-'+pid,'mirlipousse-cj-'+pid,'CJYD2064609','CJYD206460901AZ'];
test('La référence bannie est exclue par PID, variante, SKU et alias, même renommée',()=>{
 for(const id of aliases){assert.equal(isCatalogueExcluded(id),true);assert.equal(isCatalogueExcluded(id.toUpperCase()),true);}
 assert.equal(isCatalogueExcluded({name:'Nouveau nom',supplierProductId:pid,supplierVariantId:'future-variant'}),true);
 assert.equal(isCatalogueExcluded({id:'unrelated',supplierVariantSku:'CJYD206460901AZ'}),true);
 assert.equal(isCatalogueExcluded({id:'unrelated',variantId:vid}),true);
 assert.equal(isCatalogueExcluded(null),false);
 assert.equal(isCatalogueExcluded('unrelated-reference'),false);
});
test('L exclusion ne repose pas sur le mot poisson et préserve tous les autres produits',()=>{
 assert.equal(isCatalogueExcluded({id:'autre-jouet-poisson',name:'Jouet poisson'}),false);
 assert.equal(products.length,30);
 assert.equal(products.some(p=>isCatalogueExcluded(p)),false);
});
test('Un ancien panier ne réaffiche pas la trousse bannie comme référence inconnue',()=>{
 const other=products[0];
 const rows=[...aliases.map(id=>({id,quantity:1})),{id:other.id,quantity:2},{id:'ancienne-reference-inconnue',quantity:3}];
 const restored=restoreCart(rows,products);
 assert.deepEqual(restored.lines,[{id:other.id,variantId:other.supplierVariantId,quantity:2}]);
 assert.deepEqual(restored.unresolved,[{id:'ancienne-reference-inconnue',quantity:3}]);
});
test('Les favoris suppriment seulement la référence bannie et gardent les autres choix',()=>{
 const other=products[0];
 assert.deepEqual(restoreFavorites([...aliases,other.id,other.id,'ancien-favori-inconnu'],products),[other.id,'ancien-favori-inconnu']);
 assert.deepEqual(restoreFavorites(null,products),[]);
});
