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
# Mini & Moi : la preuve de variantes fournisseur prime sur les tags marketing.
assert catalogue.get('duosOnly') is True and r.get('duosOnly') is True,'DUOS_OBLIGATOIRES'
duo_path=BASE/'verification'/'DUOS-SOURCE.json';duo_sha=hashlib.sha256(duo_path.read_bytes()).hexdigest()
assert duo_sha==r.get('duosSourceSHA256')=='4b151d7745ccfcec17b2ebf6aa443fc9670ef7876bdac3e1f52bca7291ea4b53','PREUVE_DUOS_NON_QUALIFIEE'
duo_source=json.loads(duo_path.read_text());assert duo_source['format']=='mini-et-moi-duos-source/1' and duo_source['salesEnabled'] is False
models={m['pid']:m for m in duo_source['models']}
assert len(models)==len(duo_source['models']) and set(models)==set(duo_source['allowedPIDs'])
def opaque_product(pid):return 'mm-p-'+hashlib.sha256(('mini-merveilles:product:v1|cj-'+pid.lower()).encode()).hexdigest()
def opaque_variant(vid):return 'mm-v-'+hashlib.sha256(('mini-merveilles:variant:v1|'+vid.lower()).encode()).hexdigest()
by_public={opaque_product(pid):model for pid,model in models.items()}
assert {p['id'] for p in catalogue['products']}==set(by_public) and len(catalogue['products'])==len(models),'CATALOGUE_HORS_DUOS_VERIFIES'
variant_ids=set()
for product in catalogue['products']:
 model=by_public[product['id']]
 assert model['publicId']=='mini-et-moi-cj-'+model['pid'] and all(model.get(k) is True for k in ['sameSupplierModel','coordinatedFamilyRange','enfantEtAdulteProuves','variantRolesExplicit']),'MODELE_NON_ASSORTI'
 assert not {'pid','vid','duoProof'} & set(product),'PREUVE_PRIVEE_DANS_CATALOGUE_PUBLIC'
 options=product['variants'];assert isinstance(options,list) and 0<len(options)<=150
 assert product['defaultVariantId'] in {v['id'] for v in options},'VARIANTE_INITIALE_PERDUE'
 for variant in options:
  assert re.fullmatch(r'mm-v-[a-f0-9]{64}',variant['id']) and variant['id'] not in variant_ids,'VARIANTE_DUPLIQUEE'
  variant_ids.add(variant['id']);assert variant['availableForCheckout'] is False and variant['indicativePriceCents'] is None
  assert set(variant)=={'id','label','image','imageAlt','indicativePriceCents','availableForCheckout'},'VARIANTE_SCHEMA_INVALIDE'
  assert isinstance(variant['label'],str) and 0<len(variant['label'])<=200
  assert re.fullmatch(r'/media/variantes/image-[a-f0-9]{24}\.(?:jpg|png)',variant['image'])
  asset=PUBLIC/variant['image'].lstrip('/');assert asset.is_file() and not asset.is_symlink()
  assert hashlib.sha256(asset.read_bytes()).hexdigest()[:24] in asset.name,'PHOTO_OCTETS_DIFFERENTS'
 for field,role in [('childVariants','enfant'),('adultVariants','adulte')]:
  variants=model.get(field);assert isinstance(variants,list) and variants,'VARIANTE_'+role.upper()+'_REQUISE'
  assert len({v['vid'] for v in variants})==len(variants),'VARIANTE_DUPLIQUEE'
  for variant in variants:
   assert variant['sourceField'] and variant['sourceText'] and variant['role']==role,'ROLE_OU_TAILLE_NON_PROUVE'
   assert opaque_variant(variant['vid']) in {v['id'] for v in options},'VARIANTE_DUO_DOCUMENTEE_PERDUE'
assert len(variant_ids)==50,'VARIANTES_SOURCE_INCOMPLETES'
# Source privée opaque : couple exact option/libellé/photo. Le pin DUOS reste
# inchangé et vérifie déjà les cinquante VID, indépendamment de ce contrôle.
presentation_path=BASE/'verification'/'VARIANTES-OPAQUES-SOURCE.json'
assert hashlib.sha256(presentation_path.read_bytes()).hexdigest()=='3b8c6495806f44ff29f052d0b27d9cbab60a9a42642905decc7626d80708e67c','PIN_PRESENTATION_MODIFIE'
presentation=json.loads(presentation_path.read_text());assert presentation['format']=='mini-moi-opaque-presentation-source/1'
assert len(presentation['products'])==3
for product,source in zip(catalogue['products'],presentation['products']):
 assert product['id']==source['id'] and product['defaultVariantId']==source['defaultVariantId'],'PRESENTATION_PARENT_DIFFERENT'
 actual_options=[{k:v[k] for k in ['id','label','image','imageAlt']} for v in product['variants']]
 expected_options=[{k:v[k] for k in ['id','label','image','imageAlt']} for v in source['options']]
 assert actual_options==expected_options,'PRESENTATION_VARIANTE_DIFFERENTE'
 for option in source['options']:
  assert hashlib.sha256((PUBLIC/option['image'].lstrip('/')).read_bytes()).hexdigest()==option['imageSHA256'],'PHOTO_SOURCE_DIFFERENTE'


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
