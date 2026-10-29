"use client";
import {useEffect,useRef,useState} from 'react';
import {api,readWithdrawal,downloadPrivateDocument,explain,type Order,type Declaration,type WithdrawalPreview,type WithdrawalReceipt} from './commerce-client';

export default function OrderDocuments({order,accessToken,onBusyChange,onWithdrawalStarted,onWithdrawalReceived}:{order:Order;accessToken:string;onBusyChange:(busy:boolean)=>void;onWithdrawalStarted:()=>void;onWithdrawalReceived:()=>Promise<void>}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[expanded,setExpanded]=useState(false),[preview,setPreview]=useState<WithdrawalPreview|null>(null);
 const [receipt,setReceipt]=useState<WithdrawalReceipt|null>(null),[consent,setConsent]=useState(false),[uncertain,setUncertain]=useState(false),[clock,setClock]=useState(Date.now());
 const busyNow=useRef(false),issued=useRef(false),alive=useRef(true);
 function working(value:boolean){busyNow.current=value;setBusy(value);onBusyChange(value)}
 function accepted(value:WithdrawalReceipt){setReceipt(value);setPreview(null);setConsent(false);setUncertain(false);issued.current=true;onWithdrawalStarted();void onWithdrawalReceived()}
 async function checkReceipt(signal?:AbortSignal){
  if(busyNow.current||!order.reference)return;working(true);setError('');
  try{const value=readWithdrawal(await api('/api/commandes/retractation?orderToken='+encodeURIComponent(order.orderToken),undefined,accessToken,signal),order.reference);
   if(!alive.current)return;
   if(value.status==='withdrawal_received')accepted(value);
   else if(value.status==='withdrawal_not_received'){setUncertain(false);issued.current=false;setConsent(false)}
   else throw Error('INVALID_RESPONSE');
  }catch(e){if(alive.current)setError(explain(e))}finally{if(alive.current)working(false)}
 }
 useEffect(()=>{alive.current=true;const controller=new AbortController();void checkReceipt(controller.signal);const timer=setInterval(()=>setClock(Date.now()),1000);
  return()=>{alive.current=false;controller.abort();clearInterval(timer);onBusyChange(false)};
 },[]);
 async function download(kind:'confirmation'|'retractation'){
  if(busyNow.current)return;working(true);setError('');
  try{await downloadPrivateDocument(kind,order.orderToken,accessToken)}catch(e){if(alive.current)setError(explain(e))}finally{if(alive.current)working(false)}
 }
 async function prepare(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(busyNow.current||issued.current||!order.reference)return;
  const form=event.currentTarget;if(!form.reportValidity())return;const data=new FormData(form);
  const declaration:Declaration={firstName:String(data.get('firstName')||'').trim(),lastName:String(data.get('lastName')||'').trim(),reference:String(data.get('reference')||'').trim(),deliveryChannel:'download'};
  if(!declaration.firstName||!declaration.lastName||declaration.reference!==order.reference){setError('Indiquez votre prénom, votre nom et la référence exacte affichée dans ce suivi.');return}
  working(true);setError('');setConsent(false);
  try{const value=readWithdrawal(await api('/api/commandes/retractation/preparation',{orderToken:order.orderToken,...declaration},accessToken),order.reference,declaration);
   if(!alive.current)return;if(value.status==='withdrawal_received')accepted(value);else if(value.status==='withdrawal_preview'){setPreview(value);setClock(Date.now());form.reset()}else throw Error('INVALID_RESPONSE');
  }catch(e){if(alive.current)setError(explain(e))}finally{if(alive.current)working(false)}
 }
 async function confirm(){
  if(busyNow.current||issued.current||!preview||!consent||preview.expiresAt<=Date.now()||!order.reference)return;
  issued.current=true;onWithdrawalStarted();working(true);setError('');
  try{const value=readWithdrawal(await api('/api/commandes/retractation/confirmation',{orderToken:order.orderToken,declarationToken:preview.declarationToken,confirmWithdrawal:true},accessToken),order.reference);
   if(!alive.current)return;if(value.status!=='withdrawal_received')throw Error('INVALID_RESPONSE');accepted(value);
  }catch(e){if(alive.current){setError(explain(e));setUncertain(true);setConsent(false)}}finally{if(alive.current)working(false)}
 }
 const eligible=order.paid||order.documents?.confirmationAvailable===true,expired=!!preview&&preview.expiresAt<=clock;
 return <section className="order-documents" aria-labelledby="order-documents-title"><h3 id="order-documents-title">Vos documents et votre demande</h3>
  {order.documents?.confirmationAvailable&&<button type="button" className="button button-outline" onClick={()=>download('confirmation')} disabled={busy}>Enregistrer la confirmation et les conditions de ma commande</button>}
  <p>Le document de confirmation contient les informations du contrat et le formulaire type de rétractation, lorsqu’il est disponible.</p>
  {receipt?<div className="withdrawal-receipt" role="status"><h3>Votre demande a été reçue</h3><p>Pour l’ensemble de la commande {receipt.reference}, le {new Date(receipt.receivedAt).toLocaleString('fr-FR')}.</p><p>Enregistrez votre accusé de réception ci-dessous. Aucun e-mail n’a été envoyé. Cet accusé ne confirme ni remboursement ni évaluation du délai légal.</p><button type="button" className="button button-outline" disabled={busy} onClick={()=>download('retractation')}>Enregistrer l’accusé de réception de ma rétractation</button></div>:
   eligible&&<><button type="button" className="text-link" disabled={busy||uncertain} onClick={()=>setExpanded(true)}>Renoncer au contrat ici</button>
    {expanded&&<div className="withdrawal-form"><h3>Rétractation de l’ensemble de la commande</h3><p>Préparez votre déclaration, relisez-la puis confirmez son envoi. La préparation seule n’enregistre aucune demande. Le délai n’est pas déduit de la date de paiement.</p>
     {!preview?<form onSubmit={prepare} autoComplete="off"><fieldset disabled={busy}><legend>Votre déclaration</legend><label>Prénom<input name="firstName" required maxLength={80}/></label><label>Nom<input name="lastName" required maxLength={80}/></label><label>Référence exacte de la commande<input name="reference" required maxLength={120} defaultValue={order.reference||''}/></label><p>Accusé : téléchargement ici après confirmation. Aucun envoi par e-mail n’est prévu.</p><button className="button button-outline">Préparer ma déclaration — sans l’envoyer</button></fieldset></form>:
      <div className="withdrawal-preview"><h3>Relire avant d’envoyer</h3><dl><dt>Prénom et nom</dt><dd>{preview.declaration.firstName} {preview.declaration.lastName}</dd><dt>Commande entière</dt><dd>{preview.declaration.reference}</dd><dt>Accusé de réception</dt><dd>Document à enregistrer ici après confirmation</dd></dl>
       {uncertain?<p role="status">La réponse n’a pas été confirmée. Vérifiez la réception de cette même déclaration avant de recommencer. Son accès privé reste conservé sur cet appareil.</p>:<><p>{expired?'Cette préparation a expiré. Vérifiez sa réception avant de recommencer.':'Votre déclaration n’est pas encore envoyée.'}</p><label className="checkout-consent"><input type="checkbox" checked={consent} disabled={busy||expired} onChange={e=>setConsent(e.target.checked)}/><span>Je confirme ma volonté de me rétracter pour l’ensemble de cette commande et de recevoir l’accusé par téléchargement ici.</span></label><button type="button" className="button button-dark" disabled={busy||expired||!consent} onClick={confirm}>Confirmer et envoyer ma demande de rétractation</button><button type="button" className="text-link" disabled={busy} onClick={()=>{setPreview(null);setConsent(false)}}>Corriger ma déclaration</button></>}
      </div>}
    </div>}
   </>}
  {!receipt&&<button type="button" className="text-link" disabled={busy} onClick={()=>checkReceipt()}>Vérifier la réception de ma demande</button>}
  <p className="commerce-error" role="status">{error}</p><p>Vous pouvez aussi écrire à <a href="mailto:miniandmerveilles@gmail.com">miniandmerveilles@gmail.com</a>. Ne publiez pas votre code d’accès dans un avis.</p>
 </section>;
}
