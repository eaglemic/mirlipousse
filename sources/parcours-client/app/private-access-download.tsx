import {useState} from 'react';
import {downloadPrivateAccess} from './private-access';

export default function PrivateAccessDownload({orderToken,accessToken,disabled=false}:{orderToken:string;accessToken:string;disabled?:boolean}){
 const [message,setMessage]=useState('');
 function save(){try{downloadPrivateAccess(orderToken,accessToken);setMessage('Téléchargement demandé. Conservez ce fichier dans un emplacement privé.')}catch{setMessage('Le fichier n’a pas pu être préparé. Votre accès privé n’a pas été modifié.')}}
 return <div className="private-access-download"><button type="button" className="button button-outline" disabled={disabled} onClick={save}>Enregistrer mon accès privé</button><p className="small">Ce fichier contient le code qui ouvre votre commande. Gardez-le privé, sans le publier ni l’envoyer par message. Vous pourrez le charger dans le suivi si les données de votre navigateur sont effacées.</p>{message&&<p role="status">{message}</p>}</div>;
}
