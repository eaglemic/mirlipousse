/** Contrat commerce : prix et états serveur font autorité, aucune donnée bancaire. */
export const API_ORIGIN = 'https://mirlipousse-boutique.yellowghost64.chatgpt.site';
export type Item = {id:string;variantId:string;quantity:number};
export type DeliveryMode = 'home'|'pickup';
export type Variant = {id:string;label:string;availableForCheckout:boolean};
export type RemoteCatalogue = {salesEnabled:boolean;products:{id:string;aliases?:string[];supplierProductId:string;variants:Variant[]}[];deliveryMethods:{mode:DeliveryMode;service:'standard';countries:string[];availableForPreview:boolean;qualifiedForCheckout:boolean;reason?:string}[]};
export type Pickup = {id:string;provider:string;name:string;addressLine1:string;postalCode:string;city:string;country:string};
export type Quote = {ok:true;salesEnabled:boolean;previewOnly:boolean;country:string;currency:'EUR';subtotalIndicativeCents:number|null;shippingIndicativeCents:number|null;totalIndicativeCents:number|null;delivery:{mode:DeliveryMode;service:'standard';qualifiedForCheckout:boolean;availableForPreview:boolean;etaBusinessDays?:number[]|null};blockers?:string[]};
export type Attempt = {orderToken:string;accessToken:string;createdAt:string};
export type Order = {ok:true;orderToken:string;reference:string|null;status:string;paymentStatus:string;paid:boolean;amountCents:number;currency:'EUR';supplierStatus:string;delivery:{mode:DeliveryMode;service:'standard';country:string};supportRequired:boolean;paymentUrl?:string;tracking?:{carrier?:string;number?:string;url?:string}|null};
export class CommerceError extends Error {code:string;constructor(code:string){super(code);this.code=code;}}
const object=(x:unknown):x is Record<string,any>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const text=(x:unknown,max=200):x is string=>typeof x==='string'&&x.length>0&&x.length<=max;
const money=(x:unknown)=>x===null||Number.isSafeInteger(x)&&Number(x)>=0&&Number(x)<=100_000_000;
export const euros=(cents:number|null|undefined)=>typeof cents==='number'?new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(cents/100):'À confirmer';
export const messages:Record<string,string>={SHOP_NOT_OPEN:'Les commandes sont fermées. Aucun paiement n’a été lancé.',PICKUP_UNAVAILABLE:'Le point relais n’est pas disponible pour cette sélection. Choisissez le domicile si cette méthode est proposée.',ORDER_NOT_FOUND:'Aucune commande accessible avec ces informations. Vérifiez votre accès privé.',IDEMPOTENCY_CONFLICT:'Cette tentative existe avec d’autres informations. Vérifiez son suivi avant toute nouvelle tentative.',CANCELLATION_REQUIRES_SUPPORT:'Le paiement nécessite une intervention du service client. Aucune annulation ni remboursement automatique n’est confirmé.',RATE_LIMITED:'Trop de demandes. Patientez avant de réessayer.',NETWORK_UNCERTAIN:'La réponse n’est pas confirmée. Vérifiez le suivi de cette même tentative, sans créer une seconde commande.',STORAGE_UNAVAILABLE:'Le navigateur ne peut pas conserver l’accès privé de reprise. Aucun paiement n’a été lancé.',INVALID_RESPONSE:'Le service n’a pas renvoyé une réponse vérifiable. Aucun succès n’est supposé.'};
export const explain=(error:unknown)=>messages[error instanceof CommerceError?error.code:'']||'Le service est momentanément indisponible. Aucun paiement ou résultat favorable n’est supposé.';
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
  for(const p of value.products)if(!object(p)||!text(p.id)||!text(p.supplierProductId)||!Array.isArray(p.variants)||p.variants.length>150||p.variants.some((v:any)=>!object(v)||!text(v.id)||!text(v.label)||typeof v.availableForCheckout!=='boolean'))throw new CommerceError('INVALID_RESPONSE');
  for(const d of value.deliveryMethods)if(!object(d)||!['home','pickup'].includes(d.mode)||d.service!=='standard'||!Array.isArray(d.countries)||d.countries.some((c:any)=>!['FR','BE'].includes(c))||typeof d.availableForPreview!=='boolean'||typeof d.qualifiedForCheckout!=='boolean')throw new CommerceError('INVALID_RESPONSE');
  return value as unknown as RemoteCatalogue;
}
export function readQuote(value:any,country:string,mode:DeliveryMode,items?:Item[]):Quote{
  if(!object(value)||value.ok!==true||typeof value.salesEnabled!=='boolean'||typeof value.previewOnly!=='boolean'||value.country!==country||value.currency!=='EUR'||!['subtotalIndicativeCents','shippingIndicativeCents','totalIndicativeCents'].every(k=>money(value[k]))||!object(value.delivery)||value.delivery.mode!==mode||value.delivery.service!=='standard'||typeof value.delivery.qualifiedForCheckout!=='boolean'||typeof value.delivery.availableForPreview!=='boolean')throw new CommerceError('INVALID_RESPONSE');
  if(items){if(!Array.isArray(value.items)||value.items.length!==items.length)throw new CommerceError('INVALID_RESPONSE');const wanted=new Map(items.map(i=>[i.id+'|'+i.variantId,i.quantity]));for(const line of value.items)if(!object(line)||wanted.get(line.id+'|'+line.variantId)!==line.quantity||!money(line.unitIndicativeCents)||!money(line.lineIndicativeCents))throw new CommerceError('INVALID_RESPONSE');}
  return value as unknown as Quote;
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
  if(value.paymentUrl&&(!paymentURL(value.paymentUrl)||value.status!=='pending'))throw new CommerceError('INVALID_RESPONSE');return value as unknown as Order;
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
