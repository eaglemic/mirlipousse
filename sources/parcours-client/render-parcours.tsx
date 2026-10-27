import React from 'react';
import {renderToString} from 'react-dom/server';
import {readFile,writeFile,cp,mkdir} from 'node:fs/promises';
import path from 'node:path';
import Storefront from './app/storefront';
import OrderStatus from './app/order-status';
import {products} from './app/lib/catalogue';
import {euros} from './app/commerce-client';
const ROOT=path.resolve(new URL('..',import.meta.url).pathname),BASE=process.argv[2]?path.resolve(process.argv[2]):path.join(ROOT,'base/public'),OUT=process.argv[3]?path.resolve(process.argv[3]):path.join(ROOT,'candidat/public');
if(BASE===OUT)throw Error('BASE_ET_SORTIE_DISTINCTES_REQUISES');
const build=JSON.parse(await readFile(new URL('./dist-catalogue/.vite/manifest.json',import.meta.url),'utf8'));const entry=build['entry-client.tsx'];if(!entry?.isEntry||!entry.file.startsWith('assets/'))throw Error('ENTREE_BUILD_INVALIDE');
const css=(entry.css||[]).map((file:string)=>'<link rel="stylesheet" href="/'+file+'">').join('');
await cp(new URL('./dist-catalogue/assets/',import.meta.url),path.join(OUT,'assets'),{recursive:true});
const original=await readFile(path.join(BASE,'index.html'),'utf8');const oldScript=original.match(/<script type="module" src="[^"]+"><\/script>/);if(!oldScript)throw Error('ENTREE_ACTUELLE_ABSENTE');
const oldScriptEnd=original.indexOf(oldScript[0])+oldScript[0].length;const head=original.match(/<head>([\s\S]*?)<\/head>/)![1];const suffix=original.slice(oldScriptEnd);
// La bande contact hors React, les schémas SEO et les corrections courantes sont préservés.
const index='<!doctype html><html lang="fr"><head>'+head+css+'</head><body><div id="mirlipousse-root">'+renderToString(<Storefront/> )+'</div><script type="module" src="/'+entry.file+'"></script>'+suffix;
await writeFile(path.join(OUT,'index.html'),index);
const orderOld=await readFile(path.join(BASE,'commande/merci/index.html'),'utf8');const orderMain=orderOld.match(/<main\b[\s\S]*?<\/main>/);if(!orderMain)throw Error('COMMANDE_MAIN_ABSENT');
const order=orderOld.replace('</head>',css+'</head>').replace(orderMain[0],'<div id="mirlipousse-root" data-view="order">'+renderToString(<OrderStatus/> )+'</div>').replace('</body>','<script type="module" src="/'+entry.file+'"></script></body>');await writeFile(path.join(OUT,'commande/merci/index.html'),order);
const collectionRoot=path.join(BASE,'collections');const {readdir}=await import('node:fs/promises');let priceCards=0;
for(const slug of await readdir(collectionRoot)){
 const name=path.join('collections',slug,'index.html');const old=await readFile(path.join(BASE,name),'utf8');
 const patched=old.replace(/<article class="product-card"[\s\S]*?<\/article>/g,article=>{const match=article.match(/produit=([^"&#]+)/);if(!match)return article;const id=decodeURIComponent(match[1]);const p=products.find(p=>p.id===id||'mirlipousse-'+p.id===id);if(!p)throw Error('PRODUIT_COLLECTION_ABSENT');priceCards++;const label=typeof p.indicativePriceCents==='number'?euros(p.indicativePriceCents)+' · tarif indicatif, à confirmer':'Tarif à confirmer';return article.replace(/<p class="concept-label">.*?<\/p>/,'<p class="concept-label">'+label+'</p>');}).replace('Prix à venir ; les achats restent fermés pendant nos vérifications.','Tarifs indicatifs, à confirmer ; les achats restent fermés pendant nos vérifications.');
 await writeFile(path.join(OUT,name),patched);
}
let shipping=await readFile(path.join(BASE,'livraison-retours/index.html'),'utf8');shipping=shipping.replace('<h2>Une information par produit</h2>','<h2>Livraison standard à domicile</h2><p>Le parcours prévoit une livraison standard à domicile en France et en Belgique. Les frais et délais restent ceux du devis réellement confirmé ; aucune option express ni livraison gratuite n’est supposée.</p><h2>Point relais, lorsqu’il est proposé</h2><p>Le choix n’apparaît que si un service qualifié propose de vrais points disponibles pour la commande. Aucun annuaire fictif ou adresse libre n’est utilisé à la place. Si ce service n’est pas disponible, le site l’indique clairement.</p><h2>Suivre une commande</h2><p>Le suivi privé permet de vérifier l’état du paiement et les informations d’expédition réellement reçues. Aucun numéro de suivi n’est inventé. <a href="/commande/merci/">Reprendre ou suivre une commande</a>.</p><h2>Une information par produit</h2>');shipping=shipping.replace('<h2>Retours et service après-vente</h2>','<h2 id="retractation">Rétractation, retours et service après-vente</h2>');await writeFile(path.join(OUT,'livraison-retours/index.html'),shipping);
let privacy=await readFile(path.join(BASE,'confidentialite/index.html'),'utf8');privacy=privacy.replace('</main>','<section><h2>Accès privé de reprise de commande</h2><p>Lorsqu’un parcours de commande sera ouvert, le navigateur conservera l’identifiant de tentative et un code d’accès privé pour reprendre le même paiement et consulter son suivi. Ce code n’est jamais placé dans un lien ni envoyé dans un avis. Les coordonnées et adresses du formulaire ne sont pas enregistrées dans le stockage local.</p><p>Effacer les données du site dans votre navigateur supprime ces accès de cet appareil ; cela ne supprime pas un éventuel dossier serveur. Contactez le service client pour une demande sur vos données. Les commandes restent fermées dans la version actuelle.</p></section></main>');await writeFile(path.join(OUT,'confidentialite/index.html'),privacy);
console.log(JSON.stringify({accueilReconstruit:true,suiviCommande:true,priceCards,entry:entry.file,autresPagesCourantesPreservees:true}));
