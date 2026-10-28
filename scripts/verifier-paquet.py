"""Refuser un export incomplet ou altéré avant sa publication statique."""
from pathlib import Path
import hashlib
import json
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit

root = Path(__file__).resolve().parents[1]
proof = json.loads((root / 'verification/EXPORT.json').read_text())
if proof['succes'] is not True or proof['pagesHTML'] != 23:
    raise ValueError('EXPORT_NON_QUALIFIE')
if proof['achatsOuverts'] is not False or proof['apiDeployee'] is not False:
    raise ValueError('EXPORT_STATIQUE_SEUL_AUTORISE')
for relative, expected in proof['SHA256'].items():
    file = (root / 'public' / relative)
    if not file.resolve().is_relative_to((root / 'public').resolve()) or file.is_symlink() or not file.is_file():
        raise ValueError('CHEMIN_REFUSE: ' + relative)
    if hashlib.sha256(file.read_bytes()).hexdigest() != expected:
        raise ValueError('EMPREINTE_DIVERGENTE: ' + relative)
actual = {str(file.relative_to(root / 'public')) for file in (root / 'public').rglob('*') if file.is_file()}
if actual != set(proof['SHA256']):
    raise ValueError('INVENTAIRE_DIVERGENT')
if sum(name.endswith('.html') and name != '404.html' for name in actual) != proof['pagesHTML']:
    raise ValueError('NOMBRE_PAGES_DIVERGENT')

# Une ancienne génération ne doit pas remettre un article retiré dans la vitrine.
exclusions = json.loads((root / 'sources/parcours-client/app/lib/catalogue-exclusions.json').read_text())
for entry in exclusions['entries']:
    pid = entry['supplierProductId']
    aliases = [pid, *entry['aliases']]
    image = '/media/catalogue-cj/' + pid + '.webp'
    if image.lstrip('/') in actual:
        raise ValueError('PHOTO_PRODUIT_EXCLU: ' + pid)
    for name in actual:
        if name.endswith(('.html', '.js')):
            body = (root / 'public' / name).read_text()
            if image in body or (name.endswith('.html') and any(alias in body for alias in aliases)):
                raise ValueError('PRODUIT_EXCLU_REINTRODUIT: ' + name)

class Assets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'script' and a.get('src'):
            self.paths.append(a['src'])
        if tag == 'link' and a.get('rel') in ('stylesheet', 'modulepreload') and a.get('href'):
            self.paths.append(a['href'])
        if tag == 'img' and a.get('src'):
            self.paths.append(a['src'])

for name in actual:
    if not name.endswith('.html'):
        continue
    parser = Assets()
    parser.feed((root / 'public' / name).read_text())
    for raw in parser.paths:
        url = urlsplit(raw)
        if url.scheme or url.netloc:
            continue
        relative = unquote(url.path)
        file = root / 'public' / relative.lstrip('/') if relative.startswith('/') else root / 'public' / name / '..' / relative
        if not file.resolve().is_relative_to((root / 'public').resolve()) or not file.is_file():
            raise ValueError('ASSET_REFERENCE_ABSENT: ' + name + ' / ' + raw)
print('Export statique vérifié : 20 pages vitrine dont avis et contact + 2 saisies chiffrées + 1 connexion relais en attente ; API d’avis externe, ventes fermées.')
