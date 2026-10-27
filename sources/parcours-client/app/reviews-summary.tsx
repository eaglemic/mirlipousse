"use client";
import {useEffect,useState} from 'react';
const endpoint='https://mirlipousse-boutique.yellowghost64.chatgpt.site/api/reviews?brand=mirlipousse';
export default function ReviewsSummary(){
 const [state,setState]=useState<{status:'loading'|'ready'|'error';count:number;average:number|null}>({status:'loading',count:0,average:null});
 useEffect(()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);let active=true;fetch(endpoint,{credentials:'omit',cache:'no-store',redirect:'error',signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error('UNAVAILABLE');const data=await response.json() as {brand:string;count:number;average:number|null};if(data.brand!=='mirlipousse'||!Number.isInteger(data.count)||data.count<0||data.count===0&&data.average!==null||data.count>0&&(!(typeof data.average==='number')||!Number.isFinite(data.average)||data.average<1||data.average>5))throw new Error('INVALID');if(active)setState({status:'ready',count:data.count,average:data.average});}).catch(()=>{if(active)setState({status:'error',count:0,average:null});}).finally(()=>clearTimeout(timer));return()=>{active=false;clearTimeout(timer);controller.abort();};},[]);
 const title=state.status==='loading'?'Les avis de la communauté':state.status==='error'?'Les avis sont momentanément indisponibles':state.count===0?'Aucun avis publié pour le moment':new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(state.average!)+' / 5';
 const subtitle=state.status==='loading'?'Chargement des avis publiés…':state.status==='error'?'Vous pouvez réessayer un peu plus tard.':state.count===0?'Vos retours nous aident à faire grandir Mirlipousse.':state.count+' avis publié'+(state.count>1?'s':'');
 return <section className="reviews-bar" aria-label="Les avis sur Mirlipousse"><div aria-live="polite"><strong>{title}</strong><span>{subtitle}</span></div><a href="/avis.html#donner-avis">Découvrir et donner un avis →</a></section>;
}
