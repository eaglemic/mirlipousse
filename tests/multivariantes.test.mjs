import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {restoreSelection,addSelection,exactOption,groupVariantOptions,variantGroup} from '../public/selection-state.mjs';
import {publicProductId,publicVariantId} from '../public/public-identities.mjs';

const catalogue=JSON.parse(readFileSync(new URL('../public/catalogue.json',import.meta.url)));
const products=catalogue.products;
test('3 produits opaques,50 combinaisons réelles et3 photos de collection',()=>{
 assert.equal(products.length,3);assert.equal(products.reduce((n,p)=>n+p.variants.length,0),50);
 assert.equal(new Set(products.flatMap(p=>p.variants.map(v=>v.image))).size,3);
 assert.equal(new Set(products.flatMap(p=>p.variants.map(v=>v.id))).size,50);
 for(const p of products){assert.equal(publicProductId(p.id),p.id);assert.equal(p.purchaseEnabled,false);assert(p.variants.some(v=>v.id===p.defaultVariantId));for(const v of p.variants){assert.equal(publicVariantId(v.id),v.id);assert.equal(v.indicativePriceCents,null);assert.equal(v.availableForCheckout,false);}}
 assert(products[0].variants.some(v=>v.label==='Bleu foncé · Bébé 3–6M'));
 assert(products[0].variants.some(v=>v.label==='Bleu foncé · Homme XXL'));
 assert.equal(catalogue.salesEnabled,false);assert.equal(catalogue.duosOnly,true);
});
test('Ancienne sélection produit migrée, inconnus conservés sans substitution',()=>{
 const fake={...products[0],id:publicProductId('cj-fixture-produit')};
 const result=restoreSelection(['mini-et-moi-cj-fixture-produit','ancien-inconnu'],[fake]);
 assert.deepEqual(result.items,[]);
 assert.deepEqual(result.unresolved,[{id:fake.id},{id:'ancien-inconnu'}]);
 assert.throws(()=>restoreSelection({invalid:true},products));
 for(const variantId of ['',null,0,{},'x'.repeat(121)])assert.throws(()=>restoreSelection([{id:products[0].id,variantId}],products),/SELECTION_INVALID/);
 const cross=restoreSelection([{id:products[0].id,variantId:products[1].defaultVariantId}],products);
 assert.equal(cross.items.length,0);assert.equal(cross.unresolved[0].variantId,products[1].defaultVariantId);
});
test('Deux tailles distinctes, double-clic idempotent et borne50',()=>{
 const p=products[0],[a,b]=p.variants;
 let items=addSelection([],products,p.id,a.id);assert.equal(addSelection(items,products,p.id,a.id),items);
 items=addSelection(items,products,p.id,b.id);assert.equal(items.length,2);
 assert.deepEqual(restoreSelection(JSON.parse(JSON.stringify(items)),products).items,items);
 assert.equal(addSelection(items,products,p.id,products[1].defaultVariantId),items);
 assert.equal(exactOption(products,p.id,products[1].defaultVariantId),null);
 assert.equal(addSelection([],products,p.id,a.id,50).length,0);
});

class Element {
 constructor(){this.dataset={};this.events={};this.children=[];this.attributes={};this.textContent='';this.classList={add(){},toggle(){},contains(){return false;}};}
 addEventListener(name,callback){this.events[name]=callback;}
 setAttribute(name,value){this.attributes[name]=value;}getAttribute(name){return this.attributes[name]??null;}
 replaceChildren(){this.children=[];}append(...nodes){this.children.push(...nodes);}
 querySelector(name){return this.queries?.[name]??null;}closest(){return this.scope??null;}
 showModal(){this.open=true;}close(){this.open=false;}focus(){}
}
function ui({stored=null,refuse=false,salesEnabled=false}={}){
 const ids=Object.fromEntries(['brand-data','selection','feedback','selection-items','selection-empty','selection-clear','navigation'].map(id=>[id,new Element()]));
 ids['brand-data'].textContent=JSON.stringify({...catalogue,products,salesEnabled});
 ids.selection.queries={'[data-close]':new Element()};
 const selects=products.map(p=>{const s=new Element();s.dataset.product=p.id;s.value=p.defaultVariantId;return s;});
 const photos=products.map(()=>new Element()),buttons=products.map(p=>{const b=new Element();b.dataset.product=p.id;return b;});
 selects.forEach((select,i)=>{const scope=new Element();scope.queries={img:photos[i],'.variant-select':select};select.scope=scope;buttons[i].scope=scope;});
 const toggle=new Element(),menu=new Element(),store=new Map(stored===null?[]:[['boutique:mini-et-moi:selection:v1',stored]]);let writes=0,network=0;
 const doc={getElementById:id=>ids[id]??null,body:new Element(),documentElement:{dataset:{motionStudio:'fixture'}},addEventListener(){},
 querySelector:name=>name==='.menu-toggle'?menu:null,
 querySelectorAll:name=>({'.variant-select':selects,'.add-selection':buttons,'.selection-toggle':[toggle]})[name]??[],createElement:()=>new Element()};
 const context=vm.createContext({document:doc,location:{href:'https://mini-moi.invalid/'},URL,JSON,Map,Set,Error,restoreSelection,addSelection,exactOption,groupVariantOptions,
 localStorage:{getItem:key=>{if(refuse)throw Error('fixture read refusal');return store.get(key)??null;},setItem:(key,value)=>{writes++;if(refuse)throw Error('fixture write refusal');store.set(key,value);}},setTimeout:()=>1,clearTimeout(){},fetch:()=>{network++;throw Error('network forbidden');}});
 const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert(source.startsWith("import {restoreSelection,addSelection,exactOption,groupVariantOptions} from './selection-state.mjs';\n"));
 vm.runInContext(source.slice(source.indexOf('\n')+1),context);
 return {ids,selects,photos,buttons,toggle,store,get writes(){return writes;},get network(){return network;}};
}
test('Vrai code DOM : choix → photo exacte → identité exacte, double-clic et autre taille',()=>{
 const app=ui(),p=products[0],[a,b]=p.variants;
 app.selects[0].value=a.id;app.selects[0].events.change();assert.equal(app.photos[0].src,a.image);assert.equal(app.photos[0].alt,a.imageAlt);
 app.buttons[0].events.click();app.buttons[0].events.click();
 app.selects[0].value=b.id;app.selects[0].events.change();app.buttons[0].events.click();
 assert.deepEqual(JSON.parse(app.store.get('boutique:mini-et-moi:selection:v1')),[{id:p.id,variantId:a.id},{id:p.id,variantId:b.id}]);
 assert.equal(app.ids['selection-items'].children.length,2);assert.equal(app.ids['selection-items'].children[1].children[0].src,b.image);
 app.selects[0].value=products[1].defaultVariantId;app.buttons[0].events.click();assert.equal(app.ids['selection-items'].children.length,2);
 app.toggle.events.click();assert.equal(app.ids.selection.open,true);assert.equal(app.network,0);
});
test('Vrai code DOM : stockage refusé ou corrompu ne remplace pas l’ancienne sélection',()=>{
 const refused=ui({refuse:true});refused.selects[0].value=products[0].defaultVariantId;refused.selects[0].events.change();refused.buttons[0].events.click();assert.equal(refused.ids['selection-items'].children.length,1);assert.equal(refused.writes,0);assert.match(refused.ids.feedback.textContent,/temporaire/);
 const corrupted=ui({stored:'{invalid'});corrupted.selects[0].value=products[0].defaultVariantId;corrupted.selects[0].events.change();corrupted.buttons[0].events.click();assert.equal(corrupted.writes,0);assert.equal(corrupted.store.get('boutique:mini-et-moi:selection:v1'),'{invalid');
 for(const variantId of ['',null,0]){const saved=JSON.stringify([{id:products[0].id,variantId}]),invalid=ui({stored:saved});invalid.buttons[0].events.click();assert.equal(invalid.writes,0);assert.equal(invalid.store.get('boutique:mini-et-moi:selection:v1'),saved);}
 assert.throws(()=>ui({salesEnabled:true}),/Configuration/);
});
test('Toutes les50 variantes restent groupées sans nouveau modèle, prix ou taille inventé',()=>{
 const before=JSON.stringify(products);
 for(const p of products){const groups=groupVariantOptions(p),all=groups.flatMap(g=>g.variants);assert.equal(all.length,p.variants.length);assert.deepEqual(new Set(all.map(v=>v.id)),new Set(p.variants.map(v=>v.id)));assert(all.every(v=>variantGroup(v.label)!==null));}
 assert.equal(JSON.stringify(products),before);
});
test('Filtres de tailles : adultes, bébé, enfant strictement séparés ; aucun âge déduit des T/Y',()=>{
 let adult=0,child=0,baby=0;
 for(const p of products){const a=groupVariantOptions(p,'adulte').flatMap(g=>g.variants),b=groupVariantOptions(p,'bebe').flatMap(g=>g.variants),c=groupVariantOptions(p,'enfant').flatMap(g=>g.variants);
  assert(a.every(v=>['Femme','Homme'].includes(variantGroup(v.label))));assert(b.every(v=>variantGroup(v.label)==='Bébé'));assert(c.every(v=>['Fille','Garçon','Enfant'].includes(variantGroup(v.label))));adult+=a.length;baby+=b.length;child+=c.length;
  assert.equal(groupVariantOptions(p,'ado').length,0);assert.equal(groupVariantOptions(p,'naissance').length,0);
 }
 assert.equal(adult+child+baby,50);assert(adult>0&&child>0&&baby>0);
 assert.equal(variantGroup('Pointure38 · Noir'),null);assert.equal(variantGroup(null),null);
});
test('Sans choix explicite, aucune taille par défaut ni nouvelle écriture locale',()=>{
 const app=ui();assert(app.selects.every(s=>s.value===''));assert.equal(app.writes,0);
 app.buttons[0].events.click();assert.equal(app.ids['selection-items'].children.length,0);assert.equal(app.writes,0);
 app.selects[0].value=products[0].variants[2].id;app.selects[0].events.change();app.buttons[0].events.click();assert.equal(app.ids['selection-items'].children.length,1);
});
test('Ancienne collection sans taille reste visible et ne devient jamais une pièce par défaut',()=>{
 const app=ui({stored:JSON.stringify([products[0].id])});
 assert.equal(app.writes,0);assert.equal(app.ids['selection-items'].children.length,1);
 assert.match(app.ids['selection-items'].children[0].children[0].textContent,/taille à choisir/);
 app.selects[0].value=products[0].variants[1].id;app.buttons[0].events.click();
 const persisted=JSON.parse(app.store.get('boutique:mini-et-moi:selection:v1'));
 assert.deepEqual(persisted,[{id:products[0].id,variantId:products[0].variants[1].id},{id:products[0].id}]);
 assert.equal(persisted.some(x=>x.variantId===products[0].defaultVariantId),false);
});
