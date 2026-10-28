import test from 'node:test';
import assert from 'node:assert/strict';
import {readContractSummary,hasReadableConditions,conditionsBlob,CommerceError} from '../app/commerce-client';
const contract={version:'conditions-v3',bundleHash:'a'.repeat(64),deliveryText:'Livraison au plus tard le 05/11/2026.',items:[{name:'Article fictif',variantLabel:'Bleu',quantity:1,unitPriceCents:1000,lineTotalCents:1000}],totalCents:1399,currency:'EUR'};
const terms='VENDEUR FICTIF\nConditions de vente\nGaranties\nRetours et frais\nMédiation\nFormulaire de rétractation\nLivraison au plus tard le 05/11/2026.';
test('ancien contrat lisible mais sans conditions complètes aucune acceptation possible',()=>{
 const legacy=readContractSummary(contract,1000,1399);assert.equal(hasReadableConditions(legacy),false);assert.equal(hasReadableConditions(undefined),false);assert.throws(()=>conditionsBlob(legacy),CommerceError);
});
test('conditions intégrales bornées et version contractuelle conservée exactement',()=>{
 const ready=readContractSummary({...contract,termsText:terms},1000,1399);assert.equal(hasReadableConditions(ready),true);assert.equal(ready.version,'conditions-v3');
 for(const termsText of ['', ' \n\t',null,true,'\u0000invalide','x'.repeat(96001)])assert.throws(()=>readContractSummary({...contract,termsText},1000,1399),CommerceError);
 assert.equal(hasReadableConditions(readContractSummary({...contract,termsText:'x'.repeat(96000)},1000,1399)),true);
});
test('document TXT contient uniquement le texte reçu, jamais coordonnées ou jetons ajoutés',async()=>{
 const ready={...readContractSummary({...contract,termsText:terms},1000,1399),quoteToken:'NE_PAS_EXPORTER_QUOTE',accessToken:'NE_PAS_EXPORTER_ACCESS',contact:{email:'fictif@example.invalid'}};
 const blob=conditionsBlob(ready);assert.equal(blob.type,'text/plain;charset=utf-8');assert.equal(await blob.text(),terms);assert.equal((await blob.text()).includes('NE_PAS_EXPORTER'),false);assert.equal((await blob.text()).includes('fictif@example.invalid'),false);
});
test('chaînes ressemblant à du HTML restent du texte dans le fichier enregistré',async()=>{
 const text='<script>throw new Error("fictif")</script>\n<img src=x onerror=alert(1)>';
 const blob=conditionsBlob(readContractSummary({...contract,termsText:text},1000,1399));assert.equal(await blob.text(),text);assert.equal(blob.type,'text/plain;charset=utf-8');
});
