import test from 'node:test';
import assert from 'node:assert/strict';
import {readContractSummary,readCheckoutPreparation,readWithdrawal,readOrder,fetchPrivateDocument,CommerceError,api} from '../app/commerce-client';
const orderToken='e7806561-e0d2-45d6-a539-f83753c2996d',access='x'.repeat(43),reference='mp_fictif';
const contract={version:'conditions-v2',bundleHash:'a'.repeat(64),deliveryText:'Livraison standard à domicile selon le contrat fictif.',items:[{name:'Article <script>fictif</script>',variantLabel:'Variante fictive',quantity:2,unitPriceCents:1000,lineTotalCents:2000}],totalCents:2399,currency:'EUR'};
const quote={ok:true,status:'quoted',previewOnly:false,qualifiedForCheckout:true,orderToken,quoteToken:'opaque.fictif',expiresAt:200000,currency:'EUR',subtotalCents:2000,shippingCents:399,amountCents:2399,delivery:{mode:'home',service:'standard',country:'FR'},contract};
const declaration={firstName:'Client',lastName:'Fictif',reference,deliveryChannel:'download' as const};
const receipt={ok:true,status:'withdrawal_received',scope:'whole_order',reference,receivedAt:123456789,receiptAvailable:true,deliveryChannel:'download',emailSent:false,refundIssued:false,timelinessAssessed:false};
test('contrat final lié aux montants, version et empreinte avant confirmation',()=>{
 assert.equal(readCheckoutPreparation(quote,orderToken,'FR',100000).status,'quoted');assert.equal(readContractSummary(contract,2000,2399).version,'conditions-v2');
 for(const change of [{bundleHash:'invalid'},{currency:'USD'},{totalCents:2400},{version:''},{deliveryText:''},{items:[]},{items:[{...contract.items[0],lineTotalCents:1999}]},{items:[{...contract.items[0],quantity:0}]}])assert.throws(()=>readContractSummary({...contract,...change},2000,2399),CommerceError);
});
test('préparation RAM ne vaut pas réception et reste liée à la déclaration exacte',()=>{
 const preview={ok:true,status:'withdrawal_preview',scope:'whole_order',declarationToken:'opaque.withdrawal.fictif',expiresAt:200000,declaration};
 assert.equal(readWithdrawal(preview,reference,declaration,100000).status,'withdrawal_preview');
 for(const patch of [{scope:'partial_order'},{declarationToken:''},{expiresAt:100000},{expiresAt:700001},{declaration:{...declaration,reference:'other'}},{declaration:{...declaration,firstName:'other'}}])assert.throws(()=>readWithdrawal({...preview,...patch},reference,declaration,100000),CommerceError);
 assert.throws(()=>readWithdrawal(preview,reference),CommerceError);
});
test('accusé exige sa référence/horodatage/canal et aucune promesse financière',()=>{
 assert.deepEqual(readWithdrawal(receipt,reference),receipt);assert.deepEqual(readWithdrawal({...receipt},reference),receipt);
 for(const patch of [{reference:'other'},{receivedAt:0},{receivedAt:null},{receiptAvailable:false},{emailSent:true},{refundIssued:true},{timelinessAssessed:true},{deliveryChannel:'email'},{scope:'part'}])assert.throws(()=>readWithdrawal({...receipt,...patch},reference),CommerceError);
 assert.equal(readWithdrawal({ok:true,status:'withdrawal_not_received',scope:'whole_order'},reference).status,'withdrawal_not_received');
});
test('suivi legacy et drapeaux documents validés sans disponibilité implicite',()=>{
 const order={ok:true,orderToken,reference,status:'paid',paymentStatus:'paid',paid:true,amountCents:2399,currency:'EUR',supplierStatus:'not_requested',delivery:{mode:'home',service:'standard',country:'FR'},supportRequired:false};
 assert.equal(readOrder(order,orderToken).documents,undefined);assert.equal(readOrder({...order,documents:{confirmationAvailable:true,withdrawalReceiptAvailable:false}},orderToken).documents?.confirmationAvailable,true);
 assert.throws(()=>readOrder({...order,documents:{confirmationAvailable:'true',withdrawalReceiptAvailable:false}},orderToken),CommerceError);
});
test('document privé : Bearer uniquement en header, attachment borné et aucun token dans le Blob',async()=>{
 const previous=globalThis.fetch;const calls:any[]=[];
 globalThis.fetch=async(url:any,options:any)=>{calls.push({url,options});return new Response('<!doctype html><html><body>Confirmation fictive</body></html>',{headers:{'Content-Type':'text/html;charset=utf-8','Content-Disposition':'attachment; filename="serveur.html"'}})};
 try{const blob=await fetchPrivateDocument('confirmation',orderToken,access);assert.match(await blob.text(),/Confirmation fictive/);assert.equal(calls.length,1);assert.equal(calls[0].url.includes(access),false);assert.equal(calls[0].options.headers.Authorization,'Bearer '+access);assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.redirect,'error');assert.equal(calls[0].options.body,undefined)}finally{globalThis.fetch=previous}
});
test('mauvais Bearer, MIME/disposition, réponse trop grosse ou fuite d’accès ferment le téléchargement',async()=>{
 const previous=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({ok:false,code:'ORDER_NOT_FOUND'}),{status:404,headers:{'Content-Type':'application/json'}})};
 try{
  await assert.rejects(()=>fetchPrivateDocument('confirmation',orderToken,'bad'),(e:any)=>e.code==='ORDER_NOT_FOUND');assert.equal(calls,0);
  await assert.rejects(()=>fetchPrivateDocument('confirmation',orderToken,access),(e:any)=>e.code==='ORDER_NOT_FOUND');
  for(const [body,headers] of [['html',{'Content-Type':'application/json','Content-Disposition':'attachment'}],['html',{'Content-Type':'text/html','Content-Disposition':'inline'}],[access,{'Content-Type':'text/html','Content-Disposition':'attachment'}],['x'.repeat(2*1024*1024+1),{'Content-Type':'text/html','Content-Disposition':'attachment'}]] as const){globalThis.fetch=async()=>new Response(body,{headers});await assert.rejects(()=>fetchPrivateDocument('confirmation',orderToken,access),CommerceError)}
 }finally{globalThis.fetch=previous}
});
test('confirmation explicite et récupération perte de réponse gardent UUID/Bearer et accusé original',async()=>{
 const previous=globalThis.fetch,calls:any[]=[];let received=false;
 globalThis.fetch=async(url:any,options:any)=>{calls.push({url,options});if(url.endsWith('/confirmation')){const body=JSON.parse(options.body);assert.equal(body.confirmWithdrawal,true);assert.deepEqual(Object.keys(body).sort(),['confirmWithdrawal','declarationToken','orderToken']);received=true;throw Error('Réponse perdue fictive')}return Response.json(received?receipt:{ok:true,status:'withdrawal_not_received',scope:'whole_order'})};
 try{
  await assert.rejects(()=>api('/api/commandes/retractation/confirmation',{orderToken,declarationToken:'opaque_RAMPASURL',confirmWithdrawal:true},access),(e:any)=>e.code==='NETWORK_UNCERTAIN');
  const recovered=readWithdrawal(await api('/api/commandes/retractation?orderToken='+orderToken,undefined,access),reference);assert.deepEqual(recovered,receipt);
  assert.equal(calls.filter(c=>c.url.endsWith('/confirmation')).length,1);for(const c of calls){assert.equal(c.options.headers.Authorization,'Bearer '+access);assert.equal(c.url.includes(access),false);assert.equal(c.url.includes('opaque_RAMPASURL'),false)}
 }finally{globalThis.fetch=previous}
});
