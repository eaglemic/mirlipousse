import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToString} from 'react-dom/server';
import {API_ORIGIN,attempts,newAttempt,restorePrivateAccess,CommerceError} from '../app/commerce-client';
import {privateAccessBlob,readPrivateAccess,readPrivateAccessFile,downloadPrivateAccess} from '../app/private-access';
import PrivateAccessDownload from '../app/private-access-download';
import OrderStatus from '../app/order-status';

const orderToken='e7806561-e0d2-45d6-a539-f83753c2996d',customerKey='x'.repeat(43);
const order={ok:true,orderToken,reference:'mp_fixture',status:'pending',paymentStatus:'pending',paid:false,amountCents:4300,currency:'EUR',supplierStatus:'not_requested',delivery:{mode:'home',service:'standard',country:'FR'},supportRequired:false};
function storage(){
 const values=new Map<string,string>();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)}});
 return values;
}
const snapshot=(values:Map<string,string>)=>JSON.stringify([...values]);

test('export strict à trois champs versionnés, sans URL, prix ni donnée client',async()=>{
 const blob=privateAccessBlob(orderToken,customerKey),raw=await blob.text();
 assert.equal(blob.type,'application/json');assert.ok(blob.size<4096);
 assert.deepEqual(JSON.parse(raw),{format:'mini-et-merveilles-acces-prive/1',orderToken,customerKey});
 assert.deepEqual(readPrivateAccess(raw),{orderToken,accessToken:customerKey});
 for(const forbidden of ['http','price','amount','contact','email','address','reference','createdAt'])assert.equal(raw.includes(forbidden),false);
 assert.throws(()=>privateAccessBlob(orderToken,'bad'),CommerceError);
});

test('perte du cache : charger ne stocke rien, puis le seul suivi vérifié restaure l’accès',async()=>{
 const values=storage(),attempt=newAttempt(),blob=privateAccessBlob(attempt.orderToken,attempt.accessToken);values.clear();
 const previous=globalThis.fetch,calls:any[]=[];globalThis.fetch=async(url:any,options:any)=>{calls.push({url,options});return Response.json({...order,orderToken:attempt.orderToken})};
 try{
  const imported=await readPrivateAccessFile(blob);assert.equal(values.size,0);assert.equal(calls.length,0);
  const restoredOrder=await restorePrivateAccess(imported.orderToken,imported.accessToken);assert.equal(restoredOrder.accessSaved,true);assert.equal(restoredOrder.order.orderToken,attempt.orderToken);
  assert.equal(calls.length,1);assert.equal(calls[0].url,API_ORIGIN+'/api/commandes/suivi?orderToken='+attempt.orderToken);
  assert.equal(calls[0].url.includes(attempt.accessToken),false);assert.equal(calls[0].options.body,undefined);
  assert.equal(calls[0].options.headers.Authorization,'Bearer '+attempt.accessToken);assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.redirect,'error');
  assert.equal(attempts()[0].orderToken,attempt.orderToken);assert.equal(attempts()[0].accessToken,attempt.accessToken);
  const restored=JSON.parse([...values.values()][0]);assert.deepEqual(Object.keys(restored[0]).sort(),['accessToken','createdAt','orderToken']);
 }finally{globalThis.fetch=previous}
});

test('fichiers malformés, champs supplémentaires et types coercitifs préservent les accès',async()=>{
 const values=storage();newAttempt();const before=snapshot(values),raw=await privateAccessBlob(orderToken,customerKey).text(),valid=JSON.parse(raw),previous=globalThis.fetch;
 globalThis.fetch=async()=>assert.fail('La lecture de fichier ne doit jamais effectuer de requête');
 try{
  for(const source of ['not-json','<script>throw Error()</script>',JSON.stringify(null),JSON.stringify([]),JSON.stringify('url'),
   ...[{...valid,format:'mini-et-merveilles-acces-prive/2'},{...valid,url:'https://tiers.example.invalid/voler'},
    {...valid,contact:{email:'client@example.invalid'}},{...valid,orderToken:[orderToken]},{...valid,customerKey:[customerKey]},
    {...valid,customerKey:'javascript:alert(1)'},{...valid,customerKey:123}].map(value=>JSON.stringify(value))]){
   assert.throws(()=>readPrivateAccess(source),CommerceError);assert.equal(snapshot(values),before);
  }
  assert.equal(readPrivateAccess(raw).orderToken,orderToken);assert.equal(snapshot(values),before);
 }finally{globalThis.fetch=previous}
});

test('limite de 4 Kio avant lecture et après décodage, sans toucher au stockage',async()=>{
 const values=storage();newAttempt();const before=snapshot(values),raw=await privateAccessBlob(orderToken,customerKey).text();
 const boundary=raw+' '.repeat(4096-new TextEncoder().encode(raw).length);assert.equal(readPrivateAccess(boundary).orderToken,orderToken);
 let reads=0;await assert.rejects(()=>readPrivateAccessFile({size:4097,text:async()=>{reads++;return raw}}),CommerceError);assert.equal(reads,0);
 await assert.rejects(()=>readPrivateAccessFile({size:1,text:async()=>boundary+' '}),CommerceError);
 await assert.rejects(()=>readPrivateAccessFile({size:0,text:async()=>raw}),CommerceError);assert.equal(snapshot(values),before);
});

test('mauvais code, réseau perdu et réponse incohérente ne remplacent jamais un accès conservé',async()=>{
 const values=storage(),attempt=newAttempt(),before=snapshot(values),previous=globalThis.fetch;
 try{
  for(const response of [async()=>Response.json({ok:false,code:'ORDER_NOT_FOUND'},{status:404}),async()=>{throw Error('perte fictive')},async()=>Response.json(order)]){
   globalThis.fetch=response;
   await assert.rejects(()=>restorePrivateAccess(attempt.orderToken,customerKey),CommerceError);assert.equal(snapshot(values),before);
   assert.equal(attempts()[0].accessToken,attempt.accessToken);
  }
 }finally{globalThis.fetch=previous}
});

test('erreur de stockage conserve la préimage et laisse le suivi validé consultable',async()=>{
 const values=storage();newAttempt();const before=snapshot(values),previous=globalThis.fetch,original=globalThis.localStorage;
 globalThis.fetch=async()=>Response.json(order);
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{...original,setItem:()=>{throw Error('quota fictif')}}});
 try{const result=await restorePrivateAccess(orderToken,customerKey);assert.equal(result.accessSaved,false);assert.deepEqual(result.order,order);assert.equal(snapshot(values),before)}finally{globalThis.fetch=previous}
});

test('échec de relecture du stockage restaure la valeur précédente et laisse la tentative active intacte',async()=>{
 const values=storage();newAttempt();values.set('mirlipousse.commandes.acces.v1.active','tentative-active-fictive');const before=snapshot(values),previous=globalThis.fetch;
 let changed=false,wrongRead=false;
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>{if(changed&&!wrongRead&&key==='mirlipousse.commandes.acces.v1'){wrongRead=true;return '[]'}return values.get(key)??null},setItem:(key:string,value:string)=>{values.set(key,value);changed=true},removeItem:(key:string)=>values.delete(key)}});
 globalThis.fetch=async()=>Response.json(order);
 try{const result=await restorePrivateAccess(orderToken,customerKey);assert.equal(result.accessSaved,false);assert.deepEqual(result.order,order);assert.equal(snapshot(values),before)}finally{globalThis.fetch=previous}
});

test('téléchargement local à nom fixe et rendu initial sans code prérempli ni URL secrète',async()=>{
 const previousDocument=Object.getOwnPropertyDescriptor(globalThis,'document'),previousFetch=globalThis.fetch,previousCreate=URL.createObjectURL;
 const links:any[]=[],blobs:Blob[]=[];
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement:(tag:string)=>{assert.equal(tag,'a');const link={href:'',download:'',rel:'',click(){links.push({...this})},remove(){}};return link},body:{append(){}}}});
 URL.createObjectURL=blob=>{blobs.push(blob);return previousCreate(blob)};
 globalThis.fetch=async()=>assert.fail('La sauvegarde locale ne doit effectuer aucune requête');
 try{
  downloadPrivateAccess(orderToken,customerKey);assert.equal(links.length,1);assert.equal(links[0].download,'mini-et-merveilles-acces-prive.json');
  assert.ok(links[0].href.startsWith('blob:'));assert.equal(links[0].href.includes(customerKey),false);assert.equal(links[0].href.includes(orderToken),false);
  assert.deepEqual(JSON.parse(await blobs[0].text()),{format:'mini-et-merveilles-acces-prive/1',orderToken,customerKey});
  const rendered=renderToString(createElement(PrivateAccessDownload,{orderToken,accessToken:customerKey}));
  assert.match(rendered,/Enregistrer mon accès privé/);assert.equal(rendered.includes(customerKey),false);assert.equal(rendered.includes(orderToken),false);
  const status=renderToString(createElement(OrderStatus));assert.match(status,/type="file"/);assert.equal(status.includes(customerKey),false);assert.equal(status.includes(orderToken),false);
 }finally{URL.createObjectURL=previousCreate;globalThis.fetch=previousFetch;if(previousDocument)Object.defineProperty(globalThis,'document',previousDocument);else Reflect.deleteProperty(globalThis,'document')}
});
