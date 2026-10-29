import {publicProductId,publicVariantId} from './lib/public-identities.mjs';
/** Contrat commerce : prix et états serveur font autorité, aucune donnée bancaire. */
export const API_ORIGIN = 'https://mirlipousse-boutique.yellowghost64.chatgpt.site';
export type Item = {id:string;variantId:string;quantity:number};
export type DeliveryMode = 'home'|'pickup';
export type Variant = {id:string;label:string;image?:string;imageAlt?:string;indicativePriceCents?:number|null;availableForCheckout:boolean};
export type RemoteCatalogue = {salesEnabled:boolean;products:{id:string;variants:Variant[]}[];deliveryMethods:{mode:DeliveryMode;service:'standard';countries:string[];availableForPreview:boolean;qualifiedForCheckout:boolean;reason?:string}[]};
export type Pickup = {id:string;provider:string;name:string;addressLine1:string;postalCode:string;city:string;country:string};
export type Quote = {ok:true;salesEnabled:boolean;previewOnly:boolean;canPrepareCheckout?:boolean;country:string;currency:'EUR';subtotalIndicativeCents:number|null;shippingIndicativeCents:number|null;totalIndicativeCents:number|null;delivery:{mode:DeliveryMode;service:'standard';qualifiedForCheckout:boolean;availableForPreview:boolean;etaBusinessDays?:number[]|null};blockers?:string[]};
export type ContractSummary={version:string;bundleHash:string;deliveryText:string;termsText?:string;items:{name:string;variantLabel:string;quantity:number;unitPriceCents:number;lineTotalCents:number}[];totalCents:number;currency:'EUR'};
export type CheckoutQuote={ok:true;status:'quoted';previewOnly:false;qualifiedForCheckout:true;orderToken:string;quoteToken:string;expiresAt:number;currency:'EUR';subtotalCents:number;shippingCents:number;amountCents:number;delivery:{mode:'home';service:'standard';country:string};contract?:ContractSummary};
export type Attempt = {orderToken:string;accessToken:string;createdAt:string};
export type Order = {ok:true;orderToken:string;reference:string|null;status:string;paymentStatus:string;paid:boolean;amountCents:number;currency:'EUR';supplierStatus:string;delivery:{mode:DeliveryMode;service:'standard';country:string};supportRequired:boolean;paymentUrl?:string;tracking?:{carrier?:string;number?:string;url?:string}|null;documents?:{confirmationAvailable:boolean;withdrawalReceiptAvailable:boolean}};
export type Declaration={firstName:string;lastName:string;reference:string;deliveryChannel:'download'};
export type WithdrawalReceipt={ok:true;status:'withdrawal_received';scope:'whole_order';reference:string;receivedAt:number;receiptAvailable:true;deliveryChannel:'download';emailSent:false;refundIssued:false;timelinessAssessed:false};
export type WithdrawalPreview={ok:true;status:'withdrawal_preview';scope:'whole_order';declarationToken:string;expiresAt:number;declaration:Declaration};
export type WithdrawalState=WithdrawalReceipt|{ok:true;status:'withdrawal_not_received';scope:'whole_order'};
export class CommerceError extends Error {code:string;constructor(code:string){super(code);this.code=code;}}
const object=(x:unknown):x is Record<string,any>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const text=(x:unknown,max=200):x is string=>typeof x==='string'&&x.length>0&&x.length<=max;
const money=(x:unknown)=>x===null||Number.isSafeInteger(x)&&Number(x)>=0&&Number(x)<=100_000_000;
export const euros=(cents:number|null|undefined)=>typeof cents==='number'?new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(cents/100):'À confirmer';
export const messages:Record<string,string>={SHOP_NOT_OPEN:'Les commandes sont fermées. Aucun paiement n’a été lancé.',PICKUP_UNAVAILABLE:'Le point relais n’est pas disponible pour cette sélection. Choisissez le domicile si cette méthode est proposée.',ORDER_NOT_FOUND:'Aucune commande accessible avec ces informations. Vérifiez votre accès privé.',IDEMPOTENCY_CONFLICT:'Cette tentative existe avec d’autres informations. Vérifiez son suivi avant toute nouvelle tentative.',CANCELLATION_REQUIRES_SUPPORT:'Le paiement nécessite une intervention du service client. Aucune annulation ni remboursement automatique n’est confirmé.',RATE_LIMITED:'Trop de demandes. Patientez avant de réessayer.',NETWORK_UNCERTAIN:'La réponse n’est pas confirmée. Vérifiez le suivi de cette même tentative, sans créer une seconde commande.',STORAGE_UNAVAILABLE:'Le navigateur ne peut pas conserver l’accès privé de reprise. Aucun paiement n’a été lancé.',INVALID_RESPONSE:'Le service n’a pas renvoyé une réponse vérifiable. Aucun succès n’est supposé.'};
export const explain=(error:unknown)=>messages[error instanceof CommerceError?error.code:'']||'Le service est momentanément indisponible. Aucun paiement ou résultat favorable n’est supposé.';
Object.assign(messages,{QUOTE_INVALID:'Le devis ne peut pas être confirmé. Demandez un nouveau devis avant de payer.',QUOTE_EXPIRED:'Ce devis a expiré. Demandez un nouveau devis pour connaître le montant actuel.',SHIPPING_NOT_VALIDATED:'La livraison ne peut pas être confirmée pour cette adresse. Aucun paiement n’a été lancé.',TERMS_REQUIRED:'Confirmez les informations et les conditions avant de continuer.'});
Object.assign(messages,{DOCUMENT_NOT_FOUND:'Ce document n’est pas disponible pour cette commande.',DOCUMENT_UNAVAILABLE:'Le document ne peut pas être téléchargé pour le moment. Réessayez ou contactez Mini & Merveilles.',DECLARATION_INVALID:'Vérifiez le nom, le prénom et la référence exacte de votre commande.',DECLARATION_EXPIRED:'La préparation de votre déclaration a expiré. Vérifiez d’abord si elle a été reçue, puis recommencez si nécessaire.'});
messages.WITHDRAWAL_INVALID=messages.DECLARATION_INVALID;
messages.WITHDRAWAL_EXPIRED=messages.DECLARATION_EXPIRED;
export async function api(path:string,body?:unknown,accessToken?:string,signal?:AbortSignal):Promise<any>{
  if(!path.startsWith('/api/'))throw new CommerceError('INVALID_RESPONSE');
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});
  try{
    const headers:Record<string,string>={Accept:'application/json'};if(body!==undefined)headers['Content-Type']='application/json';if(accessToken)headers.Authorization='Bearer '+accessToken;
    const response=await fetch(API_ORIGIN+path,{method:body===undefined?'GET':'POST',headers,body:body===undefined?undefined:JSON.stringify(body),credentials:'omit',cache:'no-store',redirect:'error',signal:controller.signal});
    const result=await response.json();if(!response.ok||!object(result)||result.ok!==true)throw new CommerceError(object(result)&&text(result.code,80)?result.code:object(result)&&object(result.error)&&text(result.error.code,80)?result.error.code:'INVALID_RESPONSE');return result;
  }catch(error){if(error instanceof CommerceError)throw error;throw new CommerceError('NETWORK_UNCERTAIN');}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
export function readCatalogue(value:any):RemoteCatalogue{
  if(!object(value)||value.ok!==true||value.brand!=='mirlipousse'||typeof value.salesEnabled!=='boolean'||!Array.isArray(value.products)||value.products.length>150||!Array.isArray(value.deliveryMethods))throw new CommerceError('INVALID_RESPONSE');
  const productIds=new Set<string>(),variantIds=new Set<string>();
  for(const p of value.products){
   if(!object(p)||!text(p.id)||publicProductId(p.id)!==p.id||productIds.has(p.id)||!Array.isArray(p.variants)||p.variants.length>150)throw new CommerceError('INVALID_RESPONSE');productIds.add(p.id);
   for(const v of p.variants){
    if(!object(v)||!text(v.id)||publicVariantId(v.id)!==v.id||variantIds.has(v.id)||!text(v.label)||typeof v.availableForCheckout!=='boolean'
     ||v.image!==undefined&&(typeof v.image!=='string'||!/^\/media\/variantes\/image-[a-f0-9]{24}\.(?:jpg|png|webp|gif)$/.test(v.image))
     ||v.imageAlt!==undefined&&!text(v.imageAlt,500)||v.indicativePriceCents!==undefined&&!money(v.indicativePriceCents))throw new CommerceError('INVALID_RESPONSE');variantIds.add(v.id);
   }
  }
  for(const d of value.deliveryMethods)if(!object(d)||!['home','pickup'].includes(d.mode)||d.service!=='standard'||!Array.isArray(d.countries)||d.countries.some((c:any)=>!['FR','BE'].includes(c))||typeof d.availableForPreview!=='boolean'||typeof d.qualifiedForCheckout!=='boolean')throw new CommerceError('INVALID_RESPONSE');
  return value as unknown as RemoteCatalogue;
}
export function readQuote(value:any,country:string,mode:DeliveryMode,items?:Item[]):Quote{
  if(!object(value)||value.ok!==true||typeof value.salesEnabled!=='boolean'||typeof value.previewOnly!=='boolean'||value.country!==country||value.currency!=='EUR'||!['subtotalIndicativeCents','shippingIndicativeCents','totalIndicativeCents'].every(k=>money(value[k]))||!object(value.delivery)||value.delivery.mode!==mode||value.delivery.service!=='standard'||typeof value.delivery.qualifiedForCheckout!=='boolean'||typeof value.delivery.availableForPreview!=='boolean')throw new CommerceError('INVALID_RESPONSE');
  if(value.canPrepareCheckout!==undefined&&typeof value.canPrepareCheckout!=='boolean')throw new CommerceError('INVALID_RESPONSE');
  if(items){if(!Array.isArray(value.items)||value.items.length!==items.length)throw new CommerceError('INVALID_RESPONSE');const wanted=new Map(items.map(i=>[i.id+'|'+i.variantId,i.quantity])),seen=new Set<string>();if(wanted.size!==items.length)throw new CommerceError('INVALID_RESPONSE');for(const line of value.items){const key=object(line)?line.id+'|'+line.variantId:'';if(!object(line)||seen.has(key)||wanted.get(key)!==line.quantity||!money(line.unitIndicativeCents)||!money(line.lineIndicativeCents)||line.lineIndicativeCents!==(line.unitIndicativeCents===null?null:line.unitIndicativeCents*line.quantity))throw new CommerceError('INVALID_RESPONSE');seen.add(key);}}
  return value as unknown as Quote;
}
/** L’admission du formulaire n’est pas un devis final et n’autorise aucun paiement. */
export function canPrepareCheckout(catalogue:RemoteCatalogue|null,quote:Quote|null,items:Item[],country:string){
 return catalogue?.salesEnabled===true&&quote?.salesEnabled===true&&quote.canPrepareCheckout===true&&quote.previewOnly===true&&quote.country===country&&quote.delivery.mode==='home'
  &&catalogue.deliveryMethods.some(d=>d.mode==='home'&&d.service==='standard'&&d.countries.includes(country)&&d.availableForPreview)
  &&items.length>0&&items.every(i=>catalogue.products.some(p=>p.id===i.id&&p.variants.some(v=>v.id===i.variantId&&v.availableForCheckout)));
}
/** Le jeton opaque reste en RAM ; la validation cryptographique appartient au serveur. */
export function readCheckoutPreparation(value:any,orderToken:string,country:string,now=Date.now()):CheckoutQuote|Order{
 if(value?.status!=='quoted')return readOrder(value,orderToken);
 if(!object(value)||value.ok!==true||value.previewOnly!==false||value.qualifiedForCheckout!==true||value.orderToken!==orderToken||!text(value.quoteToken,65536)||/[\s\x00-\x1f]/.test(value.quoteToken)
  ||!Number.isSafeInteger(value.expiresAt)||value.expiresAt<=now||value.currency!=='EUR'||!['subtotalCents','shippingCents','amountCents'].every(k=>Number.isSafeInteger(value[k])&&value[k]>=0&&value[k]<=100_000_000)
  ||value.amountCents<=0||value.subtotalCents+value.shippingCents!==value.amountCents||!object(value.delivery)||value.delivery.mode!=='home'||value.delivery.service!=='standard'||value.delivery.country!==country)throw new CommerceError('INVALID_RESPONSE');
 if(value.contract!==undefined)readContractSummary(value.contract,value.subtotalCents,value.amountCents);
 return value as CheckoutQuote;
}
export function readPickups(value:any,country:string):Pickup[]{
  if(!object(value)||value.ok!==true||typeof value.available!=='boolean'||!Array.isArray(value.points)||value.points.length>50)throw new CommerceError('INVALID_RESPONSE');
  if(!value.available){if(value.points.length)throw new CommerceError('INVALID_RESPONSE');return [];}
  if(value.points.some((p:any)=>!object(p)||!['id','provider','name','addressLine1','postalCode','city'].every(k=>text(p[k]))||p.country!==country))throw new CommerceError('INVALID_RESPONSE');return value.points;
}
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const CHECKOUT_UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function paymentURL(value:unknown):string|null{
  if(typeof value!=='string')return null;try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='checkout.sumup.com'&&!u.port&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname.startsWith('/pay/')&&CHECKOUT_UUID.test(u.pathname.slice(5))?u.href:null;}catch{return null;}
}
export function readOrder(value:any,token:string):Order{
  const states=['prepared','submitting','pending','uncertain','review','paid','failed','expired','cancellation_requested','cancelled'];
  if(!object(value)||value.ok!==true||value.orderToken!==token||!(text(value.reference)||value.reference===null&&value.status==='prepared')||!states.includes(value.status)||!states.includes(value.paymentStatus)||typeof value.paid!=='boolean'||value.paid!==(value.status==='paid')||!Number.isSafeInteger(value.amountCents)||value.amountCents<=0||value.currency!=='EUR'||!text(value.supplierStatus)||!object(value.delivery)||!['home','pickup'].includes(value.delivery.mode)||value.delivery.service!=='standard'||!['FR','BE'].includes(value.delivery.country)||typeof value.supportRequired!=='boolean')throw new CommerceError('INVALID_RESPONSE');
  if(value.paymentUrl&&(!paymentURL(value.paymentUrl)||value.status!=='pending'))throw new CommerceError('INVALID_RESPONSE');
  if(value.documents!==undefined&&(!object(value.documents)||typeof value.documents.confirmationAvailable!=='boolean'||typeof value.documents.withdrawalReceiptAvailable!=='boolean'))throw new CommerceError('INVALID_RESPONSE');return value as unknown as Order;
}

export function readContractSummary(value:any,subtotal:number,total:number):ContractSummary{
 if(!object(value)||!text(value.version,120)||/[\x00-\x1f]/.test(value.version)
  ||typeof value.bundleHash!=='string'||!/^[a-f0-9]{64}$/.test(value.bundleHash)||!text(value.deliveryText,12000)
  ||!Array.isArray(value.items)||!value.items.length||value.items.length>20||value.currency!=='EUR'||value.totalCents!==total)throw new CommerceError('INVALID_RESPONSE');
 if(value.termsText!==undefined&&!readableTerms(value.termsText))throw new CommerceError('INVALID_RESPONSE');
 let sum=0;for(const line of value.items){
  if(!object(line)||!text(line.name,500)||!text(line.variantLabel,500)||!Number.isSafeInteger(line.quantity)||line.quantity<1||line.quantity>10
   ||!Number.isSafeInteger(line.unitPriceCents)||line.unitPriceCents<1||line.unitPriceCents>200000||line.lineTotalCents!==line.unitPriceCents*line.quantity)throw new CommerceError('INVALID_RESPONSE');
  sum+=line.lineTotalCents;
 }
 if(sum!==subtotal)throw new CommerceError('INVALID_RESPONSE');return value as ContractSummary;
}
const readableTerms=(value:unknown):value is string=>typeof value==='string'&&value.trim().length>0&&value.length<=96000
 &&new TextEncoder().encode(value).length<=384000&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value);
export function hasReadableConditions(contract:ContractSummary|undefined):contract is ContractSummary&{termsText:string}{return !!contract&&readableTerms(contract.termsText)}
export function conditionsBlob(contract:ContractSummary):Blob{
 if(!hasReadableConditions(contract))throw new CommerceError('INVALID_RESPONSE');
 // Only the server's public contractual text. No customer, capability, quote
 // token, order UUID or internal metadata is appended to the downloadable file.
 return new Blob([contract.termsText],{type:'text/plain;charset=utf-8'});
}
export function downloadConditions(contract:ContractSummary){
 const url=URL.createObjectURL(conditionsBlob(contract)),link=document.createElement('a');link.href=url;link.download='mirlipousse-conditions-de-vente.txt';link.rel='noopener';
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function readWithdrawal(value:any,reference:string,expected?:Declaration,now=Date.now()):WithdrawalState|WithdrawalPreview{
 if(!object(value)||value.ok!==true||value.scope!=='whole_order')throw new CommerceError('INVALID_RESPONSE');
 if(value.status==='withdrawal_not_received')return value as WithdrawalState;
 if(value.status==='withdrawal_received'){
  if(value.reference!==reference||!Number.isSafeInteger(value.receivedAt)||value.receivedAt<=0||value.receiptAvailable!==true||value.deliveryChannel!=='download'
   ||value.emailSent!==false||value.refundIssued!==false||value.timelinessAssessed!==false)throw new CommerceError('INVALID_RESPONSE');
  return value as WithdrawalReceipt;
 }
 if(value.status!=='withdrawal_preview'||!expected||!text(value.declarationToken,12000)||/[\s\x00-\x1f]/.test(value.declarationToken)
  ||!Number.isSafeInteger(value.expiresAt)||value.expiresAt<=now||value.expiresAt>now+10*60_000||!object(value.declaration)
  ||['firstName','lastName','reference','deliveryChannel'].some(k=>value.declaration[k]!==expected[k as keyof Declaration])
  ||value.declaration.reference!==reference||value.declaration.deliveryChannel!=='download'
  ||!text(value.declaration.firstName,80)||!text(value.declaration.lastName,80))throw new CommerceError('INVALID_RESPONSE');
 return value as WithdrawalPreview;
}

/** No Bearer in URL or navigation. Only an authenticated attachment becomes a
 * bounded HTML Blob; its safe filename is chosen locally, not by the response.
 */
export async function fetchPrivateDocument(kind:'confirmation'|'retractation',orderToken:string,accessToken:string):Promise<Blob>{
 if(!validAccess(orderToken,accessToken)||!['confirmation','retractation'].includes(kind))throw new CommerceError('ORDER_NOT_FOUND');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{
  const response=await fetch(API_ORIGIN+'/api/commandes/documents?orderToken='+encodeURIComponent(orderToken)+'&kind='+kind,
   {headers:{Accept:'text/html',Authorization:'Bearer '+accessToken},credentials:'omit',cache:'no-store',redirect:'error',signal:controller.signal});
  if(!response.ok){const result=await response.json().catch(()=>null);throw new CommerceError(object(result)&&text(result.code,80)?result.code:'DOCUMENT_UNAVAILABLE')}
  if(!/^text\/html(?:;|$)/i.test(response.headers.get('content-type')||'')||!/^attachment(?:;|$)/i.test(response.headers.get('content-disposition')||''))throw new CommerceError('INVALID_RESPONSE');
  const reader=response.body?.getReader();if(!reader)throw new CommerceError('INVALID_RESPONSE');const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2*1024*1024){controller.abort();await reader.cancel();throw new CommerceError('INVALID_RESPONSE')}chunks.push(value)}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
  const content=new TextDecoder('utf-8',{fatal:true}).decode(bytes);if(!content||content.includes(accessToken))throw new CommerceError('INVALID_RESPONSE');
  return new Blob([content],{type:'text/html;charset=utf-8'});
 }catch(e){if(e instanceof CommerceError)throw e;throw new CommerceError('NETWORK_UNCERTAIN')}finally{clearTimeout(timer)}
}
export async function downloadPrivateDocument(kind:'confirmation'|'retractation',orderToken:string,accessToken:string){
 const blob=await fetchPrivateDocument(kind,orderToken,accessToken),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=kind==='confirmation'?'mirlipousse-confirmation.html':'mirlipousse-accuse-retractation.html';link.rel='noopener';
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const STORE='mirlipousse.commandes.acces.v1';
export function attempts():Attempt[]{
  try{const saved=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(saved)?saved.filter(x=>object(x)&&UUID.test(x.orderToken)&&TOKEN.test(x.accessToken)&&typeof x.createdAt==='string'&&Number.isFinite(Date.parse(x.createdAt))).slice(-20):[];}catch{return [];}
}
export function newAttempt():Attempt{
  const bytes=crypto.getRandomValues(new Uint8Array(32));const accessToken=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');bytes.fill(0);
  const attempt={orderToken:crypto.randomUUID(),accessToken,createdAt:new Date().toISOString()};
  try{const saved=[...attempts(),attempt].slice(-20);localStorage.setItem(STORE,JSON.stringify(saved));if(!attempts().some(x=>x.orderToken===attempt.orderToken&&x.accessToken===attempt.accessToken))throw Error();}catch{throw new CommerceError('STORAGE_UNAVAILABLE');}return attempt;
}
export function beginAttempt():Attempt{
  try{const active=localStorage.getItem(STORE+'.active');if(active){const saved=attempts().find(a=>a.orderToken===active);if(saved)return saved;throw new CommerceError('STORAGE_UNAVAILABLE');}const next=newAttempt();localStorage.setItem(STORE+'.active',next.orderToken);if(localStorage.getItem(STORE+'.active')!==next.orderToken)throw new CommerceError('STORAGE_UNAVAILABLE');return next;}catch(error){if(error instanceof CommerceError)throw error;throw new CommerceError('STORAGE_UNAVAILABLE');}
}
export function finishAttempt(orderToken:string){try{if(localStorage.getItem(STORE+'.active')===orderToken)localStorage.removeItem(STORE+'.active');}catch{/* Les accès historiques restent conservés. */}}
export function validAccess(orderToken:string,accessToken:string):boolean{return UUID.test(orderToken)&&TOKEN.test(accessToken);}
export const orderLabels:Record<string,string>={prepared:'Préparation en cours',submitting:'Vérification en cours',pending:'Paiement en attente',uncertain:'Réponse à vérifier',review:'Vérification par le service client',paid:'Paiement confirmé côté serveur',failed:'Paiement non abouti',expired:'Tentative expirée',cancellation_requested:'Annulation demandée, en attente de confirmation',cancelled:'Annulation confirmée'};
