import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToString} from 'react-dom/server';
import ProductRegulatoryInfo from '../app/components/product-regulatory-info.tsx';
import {readCatalogue,type Variant} from '../app/commerce-client.ts';
const id='mm-p-'+'a'.repeat(64),vid='mm-v-'+'b'.repeat(64);
const info={manufacturer:'Fabricant légal fictif — fabricant@example.invalid',responsibleEU:'Opérateur UE fictif — ue@example.invalid',warnings:'Ne pas <inventer> une précaution.',ageLabel:null};
const v:Variant={id:vid,label:'Bleu fictif',priceCents:1900,priceStatus:'fixed',priceIncludesShipping:false,availableForCheckout:true,regulatory:info};
const catalogue=(variant:unknown)=>({ok:true,brand:'mirlipousse',salesEnabled:true,products:[{id,variants:[variant]}],deliveryMethods:[]});
test('seule la variante choisie et ouverte expose ses faits réglementaires, sans âge inventé ni HTML exécuté',()=>{
 const html=renderToString(React.createElement(ProductRegulatoryInfo,{variant:v}));assert(html.includes('Fabricant légal fictif'));assert(html.includes('Opérateur UE fictif'));
 assert(html.includes('&lt;inventer&gt;'));assert(!html.includes('<inventer>'));assert(!html.includes('Âge ou usage'));assert(!html.includes(vid));
 for(const variant of [undefined,null,{...v,availableForCheckout:false},{...v,regulatory:null}])assert.equal(renderToString(React.createElement(ProductRegulatoryInfo,{variant})), '');
});
test('champs réglementaires facultatifs pour ancien serveur, complets et bornés lorsqu’ils sont fournis',()=>{
 assert.equal(readCatalogue(catalogue(v)).products[0].variants[0].regulatory?.manufacturer,info.manufacturer);
 const {regulatory,...legacy}=v;assert.doesNotThrow(()=>readCatalogue(catalogue(legacy)));
 for(const regulatory of [{...info,manufacturer:1},{...info,responsibleEU:''},{...info,warnings:'x'.repeat(1001)},{...info,ageLabel:42}])assert.throws(()=>readCatalogue(catalogue({...v,regulatory})));
});
