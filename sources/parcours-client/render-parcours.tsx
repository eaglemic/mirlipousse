/** Rendu ciblé depuis la vitrine courante : jamais de réinsertion éditoriale. */
import React from 'react';
import {renderToString} from 'react-dom/server';
import {readFile,writeFile,cp,readdir} from 'node:fs/promises';
import path from 'node:path';
import Storefront from './app/storefront';
import OrderStatus from './app/order-status';
import {products} from './app/lib/catalogue';
import {AGE_GROUPS,matchesAge,ageCoverageLabel} from './app/age-groups';
import {euros} from './app/commerce-client';
const ROOT=path.resolve(new URL('..',import.meta.url).pathname),BASE=process.argv[2]?path.resolve(process.argv[2]):path.join(ROOT,'base/public'),OUT=process.argv[3]?path.resolve(process.argv[3]):path.join(ROOT,'candidat/public');
if(BASE===OUT)throw Error('BASE_ET_SORTIE_DISTINCTES_REQUISES');
const build=JSON.parse(await readFile(new URL('./dist-catalogue/.vite/manifest.json',import.meta.url),'utf8'));const entry=build['entry-client.tsx'];if(!entry?.isEntry||!/^assets\/catalogue-[A-Za-z0-9_-]+\.js$/.test(entry.file))throw Error('ENTREE_BUILD_INVALIDE');
await cp(new URL('./dist-catalogue/assets/',import.meta.url),path.join(OUT,'assets'),{recursive:true});
function replaceRoot(html:string,content:string){
 const opening=/<div\b[^>]*\bid=["']mirlipousse-root["'][^>]*>/i.exec(html);if(!opening)throw Error('ROOT_ACTUEL_ABSENT');
 const start=opening.index+opening[0].length;const divs=/<\/?div\b[^>]*>/gi;divs.lastIndex=start;let depth=1,closing:RegExpExecArray|null=null;
 while((closing=divs.exec(html))){depth+=/^<\//.test(closing[0])?-1:1;if(depth===0)break;}
 if(!closing||depth!==0)throw Error('ROOT_NON_EQUILIBRE');
 return html.slice(0,start)+content+html.slice(closing.index);
}
function entryAssets(html:string){
 let inserted=false;const script='<script type="module" src="/'+entry.file+'"></script>';
 // Un seul module d’entrée, y compris si un ancien rendu en avait ajouté plusieurs.
 html=html.replace(/<script\b(?=[^>]*\btype=["']module["'])(?=[^>]*\bsrc=["']\/assets\/catalogue-[^"']+\.js["'])[^>]*>\s*<\/script>/gi,()=>{if(inserted)return '';inserted=true;return script;});
 if(!inserted)html=html.replace('</body>',script+'</body>');
 for(const file of entry.css||[]){if(!/^assets\/catalogue-[A-Za-z0-9_-]+\.css$/.test(file))throw Error('STYLE_INVALIDE');if(!html.includes('href="/'+file+'"'))html=html.replace('</head>','<link rel="stylesheet" href="/'+file+'"></head>');}
 return html;
}
function refreshPublicPriceNotice(html:string){return html.replace('Références et photos fournisseur réelles. Tarifs indicatifs, à confirmer ; les achats restent fermés pendant nos vérifications.', 'Photos des articles réels. Prix des articles hors livraison. Les achats restent fermés pendant nos vérifications.').replaceAll('Photo fournisseur : ', 'Photo article : ').replaceAll('Les photos fournisseur présentent les références retenues.', 'Les photos présentent les articles retenus.');}
function refreshCatalogueSEO(html:string){
 return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(script,raw)=>{
  const data=JSON.parse(raw);if(data['@type']!=='ItemList')return script;
  data.itemListElement=products.map((p,index)=>({'@type':'ListItem',position:index+1,url:'https://mirlipousse.onrender.com/?produit='+encodeURIComponent(p.id)+'#collection',name:p.name,image:'https://mirlipousse.onrender.com'+p.image}));
  if('numberOfItems' in data)data.numberOfItems=products.length;
  return '<script type="application/ld+json">'+JSON.stringify(data).replace(/</g,'\\u003c')+'</script>';
 });
}
for(const [relative,element] of [['index.html',<Storefront/>],['commande/merci/index.html',<OrderStatus/>]] as const){
 const current=await readFile(path.join(BASE,relative),'utf8');const html=refreshCatalogueSEO(entryAssets(replaceRoot(current,renderToString(element))));
 if((html.match(/id=["']mirlipousse-root["']/g)||[]).length!==1||(html.match(/<main\b/g)||[]).length!==1)throw Error('ROOT_OU_MAIN_DUPLIQUE');
 await writeFile(path.join(OUT,relative),html);
}
// Les quatre accès natifs d’âge gardent leurs textes et leurs derniers patchs.
for(const group of process.argv.includes('--app-only')?[]:AGE_GROUPS){
 const relative='collections/'+group.id+'ans/index.html';const current=await readFile(path.join(BASE,relative),'utf8');
 const list=products.filter(p=>matchesAge(p,group.id));
 const content=<section className="collection-ideas" id="idees"><p className="eyebrow">LES ÂGES INDIQUÉS SUR LES ARTICLES</p><h2>{list.length} référence{list.length>1?'s':''} à explorer.</h2><p className="native-age-notice">Pour choisir, fiez-vous à l’âge précis sur chaque fiche. Les tranches regroupent les résultats : un produit peut apparaître dans plusieurs tranches. Consultez les avertissements du fabricant pour choisir un article adapté.</p>{!list.length&&<p className="info-box">Aucune référence avec un âge indiqué pour cette tranche pour le moment. Les autres produits restent dans le catalogue.</p>}<div className="product-grid native-age-cards">{list.map(p=><article className="product-card" key={p.id} data-product-id={p.id}><a className="product-image editorial-product" href={'/?produit='+encodeURIComponent(p.id)+'&age='+group.id+'#collection'}><img src={p.image} alt={'Photo article : '+p.name} width={700} height={700} loading="lazy"/>{p.ageLabel&&<span className="age-badge">{p.ageLabel}</span>}<span className="editorial-product-cta">Découvrir →</span></a><div className="product-copy"><p>{p.catalogueCategoryLabel||p.subtitle}</p><a className="product-name" href={'/?produit='+encodeURIComponent(p.id)+'&age='+group.id+'#collection'}>{p.name}</a>{p.ageLabel&&<p className="native-age-exact">{p.ageLabel}</p>}{p.ageLabel&&ageCoverageLabel(p,group.id)&&<p className="age-coverage-native">{ageCoverageLabel(p,group.id)}</p>}<p className="concept-label">{euros(p.priceCents)} · hors livraison</p></div></article>)}</div><a className="age-tranche-link" href={'/?age='+group.id+'#collection'}>Filtrer et trier les {group.label} →</a></section>;
 const old=current.match(/<section class="collection-ideas"[^>]*>[\s\S]*?<\/section>/);if(!old)throw Error('SECTION_AGE_ABSENTE:'+relative);
 let html=refreshPublicPriceNotice(current.replace(old[0],renderToString(content)));for(const file of entry.css||[])if(!html.includes('href="/'+file+'"'))html=html.replace('</head>','<link rel="stylesheet" href="/'+file+'"></head>');
 await writeFile(path.join(OUT,relative),html);
}
// Les catégories natives réutilisent les prix fixes du catalogue sans qualifier de nouvel âge.
let badgesParType=0;const ageDirectories=new Set(AGE_GROUPS.map(g=>g.id+'ans'));
for(const directory of process.argv.includes('--app-only')?[]:await readdir(path.join(BASE,'collections'))){
 if(ageDirectories.has(directory))continue;
 const relative='collections/'+directory+'/index.html';const current=await readFile(path.join(BASE,relative),'utf8');
 const html=current.replace(/<article\b[\s\S]*?<\/article>/g,article=>{
  const match=article.match(/[?&]produit=([^&#"]+)/);if(!match)return article;
  const product=products.find(p=>p.id===decodeURIComponent(match[1]));if(!product)return article;
  let changed=article.replace(/<p class="concept-label">[\s\S]*?<\/p>/,'<p class="concept-label">'+euros(product.priceCents)+' · hors livraison</p>');
  if(!product.ageLabel)changed=changed.replace(/<span class="age-badge">[^<]*<\/span>/,'');
  else changed=changed.replace(/<span class="age-badge">[^<]*<\/span>/,'<span class="age-badge">'+product.ageLabel.split(' · ')[0]+'</span>');
  if(changed!==article)badgesParType++;return changed;
 });
 const finalHtml=refreshPublicPriceNotice(html);
 if(finalHtml!==current)await writeFile(path.join(OUT,relative),finalHtml);
}
console.log(JSON.stringify({pagesRegenerees:process.argv.includes('--app-only')?2:6,entry:entry.file,rootRemplaceSansEnveloppe:true,agesNatifsRaccordes:process.argv.includes('--app-only')?0:4,badgesParType,autresContenusConserves:true}));
