import {CommerceError,validAccess} from './commerce-client';

const FORMAT='mini-et-merveilles-acces-prive/1';
const MAX_BYTES=4096;
export type PrivateAccess={orderToken:string;accessToken:string};
const invalid=()=>new CommerceError('PRIVATE_ACCESS_INVALID');

/** Le fichier contient seulement la capacité privée, sans URL ni dossier client. */
export function privateAccessBlob(orderToken:string,accessToken:string):Blob{
 if(!validAccess(orderToken,accessToken))throw invalid();
 return new Blob([JSON.stringify({format:FORMAT,orderToken,customerKey:accessToken})+'\n'],{type:'application/json'});
}
export function readPrivateAccess(source:unknown):PrivateAccess{
 if(typeof source!=='string'||new TextEncoder().encode(source).length>MAX_BYTES)throw invalid();
 let value:unknown;try{value=JSON.parse(source)}catch{throw invalid()}
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join(',')!=='customerKey,format,orderToken')throw invalid();
 const data=value as Record<string,unknown>;
 if(data.format!==FORMAT||typeof data.orderToken!=='string'||typeof data.customerKey!=='string'||!validAccess(data.orderToken,data.customerKey))throw invalid();
 return {orderToken:data.orderToken,accessToken:data.customerKey};
}
/** Aucune requête ni écriture de stockage pendant la lecture du fichier. */
export async function readPrivateAccessFile(file:Pick<File,'size'|'text'>):Promise<PrivateAccess>{
 if(!Number.isSafeInteger(file.size)||file.size<1||file.size>MAX_BYTES)throw invalid();
 return readPrivateAccess(await file.text());
}
export function downloadPrivateAccess(orderToken:string,accessToken:string){
 const url=URL.createObjectURL(privateAccessBlob(orderToken,accessToken)),link=document.createElement('a');
 link.href=url;link.download='mini-et-merveilles-acces-prive.json';link.rel='noopener';
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
