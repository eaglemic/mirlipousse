/** Rendu ciblé depuis la vitrine courante : jamais de réinsertion éditoriale. */
import React from 'react';
import {renderToString} from 'react-dom/server';
import {readFile,writeFile,cp} from 'node:fs/promises';
import path from 'node:path';
import Storefront from './app/storefront';
import OrderStatus from './app/order-status';
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
for(const [relative,element] of [['index.html',<Storefront/>],['commande/merci/index.html',<OrderStatus/>]] as const){
 const current=await readFile(path.join(BASE,relative),'utf8');const html=entryAssets(replaceRoot(current,renderToString(element)));
 if((html.match(/id=["']mirlipousse-root["']/g)||[]).length!==1||(html.match(/<main\b/g)||[]).length!==1)throw Error('ROOT_OU_MAIN_DUPLIQUE');
 await writeFile(path.join(OUT,relative),html);
}
console.log(JSON.stringify({pagesRegenerees:2,entry:entry.file,rootRemplaceSansEnveloppe:true,autresPagesByteIdentiques:true}));
