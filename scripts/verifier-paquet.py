#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,hashlib,re
BASE=Path(__file__).resolve().parents[1];PUBLIC=BASE/'public';EXPECTED='mini-et-moi'
r=json.loads((BASE/'verification'/'EXPORT.json').read_text())
assert r['format']=='boutique-export/1' and r['brandSlug']==EXPECTED
assert r['salesEnabled'] is False
expected={x['path']:x for x in r['files']};actual={str(x.relative_to(PUBLIC)) for x in PUBLIC.rglob('*') if x.is_file()}
assert actual==set(expected),('Carte publique divergente',actual^set(expected))
for name,x in expected.items():
 p=PUBLIC/name;assert p.resolve().is_relative_to(PUBLIC.resolve()) and not p.is_symlink()
 data=p.read_bytes();assert hashlib.sha256(data).hexdigest()==x['sha256'],name;assert len(data)==x['octets'],name
 if p.suffix in ('.html','.json','.js','.mjs','.css'):
  text=data.decode();assert not re.search(r'CJ_API_KEY|ADMIN_API_TOKEN|sk_live_[A-Za-z0-9]{12,}',text),('Secret détecté',name)
catalogue=json.loads((PUBLIC/'catalogue.json').read_text());assert catalogue['brandSlug']==EXPECTED and catalogue['salesEnabled'] is False
assert len(catalogue['products'])==r['products']>0
assert all(p['priceCustomer'] is None and p['purchaseEnabled'] is False for p in catalogue['products'])
if EXPECTED=='nuitrelia':
 assert catalogue['adultOnly'] is True
 # Le backend d'avis est partagé : cette seule URL est un raccord technique,
 # pas un lien vers la boutique enfants ni une copie de son catalogue.
 shared_reviews='"endpoint": "https://mirlipousse-boutique.yellowghost64.chatgpt.site/api/reviews"'
 markup=''.join(p.read_text() for p in PUBLIC.rglob('*.html'))
 assert 'mirlipousse' not in markup.replace(shared_reviews,'"endpoint": null').lower()
else:assert catalogue['adultOnly'] is False
# La preuve brute reste en archive privée. Cette attestation publique épinglée
# conserve exactement les produits, rôles, options, libellés et photos validés.
# Ni appel fournisseur ni donnée privée n'est nécessaire au build public.
assert catalogue.get('duosOnly') is True and r.get('duosOnly') is True,'DUOS_OBLIGATOIRES'
for private_name in ['DUOS-SOURCE.json','VARIANTES-OPAQUES-SOURCE.json','NATIF-V2-FONCTIONNEL-12.json','REMISE-V2.json']:
 assert not (BASE/'verification'/private_name).exists(),'PIECE_PRIVEE_DANS_DEPOT'
assert not list(PUBLIC.glob('produits/mini-et-moi-cj-*.html')),'ALIAS_FOURNISSEUR_DANS_DEPOT'
att_path=BASE/'verification'/'ATTESTATION-CATALOGUE.json'
assert not att_path.is_symlink() and att_path.resolve().is_relative_to(BASE.resolve()),'ATTESTATION_NON_LOCALE'
assert hashlib.sha256(att_path.read_bytes()).hexdigest()==r.get('attestationCatalogueSHA256')=='e60f7d11471d41467b0818b6c732955da87a20cc8270f4680a2340529a811f04','PIN_ATTESTATION_MODIFIE'
att=json.loads(att_path.read_text())
assert set(att)=={'format','sourceDuosSHA256','sourcePresentationSHA256','catalogueSHA256','salesEnabled','qualificationCommerciale','products'},'ATTESTATION_SCHEMA_INVALIDE'
assert att['format']=='mini-moi-attestation-catalogue-public/1' and att['salesEnabled'] is False and att['qualificationCommerciale'] is False
assert att['sourceDuosSHA256']==r.get('duosSourceSHA256')=='4b151d7745ccfcec17b2ebf6aa443fc9670ef7876bdac3e1f52bca7291ea4b53','PREUVE_DUOS_NON_QUALIFIEE'
assert att['sourcePresentationSHA256']==r['multivariantes']['presentationPinSHA256']=='3b8c6495806f44ff29f052d0b27d9cbab60a9a42642905decc7626d80708e67c','PIN_PRESENTATION_MODIFIE'
assert hashlib.sha256((PUBLIC/'catalogue.json').read_bytes()).hexdigest()==att['catalogueSHA256'],'CATALOGUE_SOURCE_DIFFERENT'
by_public={m['id']:m for m in att['products']}
assert len(by_public)==len(att['products'])==3
assert {p['id'] for p in catalogue['products']}==set(by_public),'CATALOGUE_HORS_DUOS_VERIFIES'
variant_ids=set()
for product in catalogue['products']:
 model=by_public[product['id']]
 assert all(model.get(k) is True for k in ['sameSupplierModel','coordinatedFamilyRange','enfantEtAdulteProuves','variantRolesExplicit']),'MODELE_NON_ASSORTI'
 assert not {'pid','vid','duoProof'} & set(product),'PREUVE_PRIVEE_DANS_CATALOGUE_PUBLIC'
 options=product['variants'];assert isinstance(options,list) and 0<len(options)<=150
 assert product['defaultVariantId']==model['defaultVariantId'] and product['defaultVariantId'] in {v['id'] for v in options},'VARIANTE_INITIALE_PERDUE'
 for variant in options:
  assert re.fullmatch(r'mm-v-[a-f0-9]{64}',variant['id']) and variant['id'] not in variant_ids,'VARIANTE_DUPLIQUEE'
  variant_ids.add(variant['id']);assert variant['availableForCheckout'] is False and variant['indicativePriceCents'] is None
  assert set(variant)=={'id','label','image','imageAlt','indicativePriceCents','availableForCheckout'},'VARIANTE_SCHEMA_INVALIDE'
  assert isinstance(variant['label'],str) and 0<len(variant['label'])<=200
  assert re.fullmatch(r'/media/variantes/image-[a-f0-9]{24}\.(?:jpg|png)',variant['image'])
  asset=PUBLIC/variant['image'].lstrip('/');assert asset.is_file() and not asset.is_symlink()
  assert hashlib.sha256(asset.read_bytes()).hexdigest()[:24] in asset.name,'PHOTO_OCTETS_DIFFERENTS'
 children,adults=model['childVariantIds'],model['adultVariantIds']
 assert isinstance(children,list) and children and isinstance(adults,list) and adults,'VARIANTES_ENFANT_ADULTE_REQUISES'
 assert len(set(children))==len(children) and len(set(adults))==len(adults) and not set(children)&set(adults),'ROLE_VARIANTE_DUPLIQUE'
 assert set(children)|set(adults)=={v['id'] for v in options},'VARIANTE_DUO_DOCUMENTEE_PERDUE'
 actual_options=[{k:v[k] for k in ['id','label','image','imageAlt']} for v in options]
 expected_options=[{k:v[k] for k in ['id','label','image','imageAlt']} for v in model['options']]
 assert actual_options==expected_options,'PRESENTATION_VARIANTE_DIFFERENTE'
 for option in model['options']:
  assert hashlib.sha256((PUBLIC/option['image'].lstrip('/')).read_bytes()).hexdigest()==option['imageSHA256'],'PHOTO_SOURCE_DIFFERENTE'
assert len(variant_ids)==50,'VARIANTES_SOURCE_INCOMPLETES'


class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag in ('a','script','img','link'):
   for key in ('href','src'):
    if a.get(key):self.links.append(a[key])
for f in PUBLIC.rglob('*.html'):
 l=Links();l.feed(f.read_text())
 for u in l.links:
  path=urlsplit(u)
  if path.scheme or path.netloc or not path.path:continue
  local=(PUBLIC/path.path.lstrip('/')) if path.path.startswith('/') else (f.parent/path.path)
  if local.is_dir():local=local/'index.html'
  assert local.resolve().is_relative_to(PUBLIC.resolve()) and local.is_file(),(str(f),u)
css=(PUBLIC/'style.css').read_text();assert 'prefers-reduced-motion:reduce' in css
print(json.dumps({'succes':True,'brandSlug':EXPECTED,'publicFiles':len(actual),'produits':r['products'],'salesEnabled':False},ensure_ascii=False))
