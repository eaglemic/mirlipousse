"""Générer les documents publics et raccorder leurs liens, sans activer les ventes."""
from pathlib import Path
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
DATA = json.loads((ROOT / 'content/legal-pages.json').read_text())
assert DATA['salesEnabled'] is False
DOCUMENT_DATE = DATA['documentDate']
DOCUMENT_DATE_ISO = DATA['documentDateISO']
assert re.fullmatch(r'\d{4}-\d{2}-\d{2}', DOCUMENT_DATE_ISO)
CGV_DOWNLOAD_PATH = DATA['pages']['cgv']['downloads'][0]['href']
assert re.fullmatch(r'/documents/cgv-preparation-\d{8}\.txt', CGV_DOWNLOAD_PATH)
MEDIATOR_PENDING = not DATA['mediatorDesignated']
PREPARATION_NOTICE = ('Ce document est public et consultable, mais il ne permet pas de passer commande. '
                      'La franchise en base de TVA est déclarée par la vendeuse. '
                      + ('La convention de médiation, les produits, les livraisons et le parcours de vente restent à finaliser avant l’ouverture.'
                         if MEDIATOR_PENDING else 'Les produits, les livraisons et le parcours de vente restent à finaliser avant l’ouverture.'))
if not MEDIATOR_PENDING:
    assert DATA['mediator'] == {'name': 'Médiation CMFM', 'address': '19 avenue d’Italie, 75013 Paris',
                               'website': 'https://mediationcmfm.eu/consommateur/demande-mediation', 'email': 'contact@mediationcmfm.fr'}
ORIGIN = 'https://mirlipousse.onrender.com'
LINKS = [
    ('informations-legales', 'Informations légales'), ('cgv', 'CGV'),
    ('livraison-retours', 'Livraison & retours'), ('retractation', 'Rétractation'),
    ('garanties', 'Garanties'), ('mediation', 'Médiation'),
    ('confidentialite', 'Confidentialité'), ('cookies', 'Cookies'),
    ('mentions-legales', 'Mentions légales'), ('contact', 'Contact & SAV'),
    ('commande/merci', 'Suivre une commande'),
]
NAV = '<nav class="legal-footer-nav" aria-label="Informations légales et service client">' + ''.join(
    '<a href="/' + path + '/">' + escape(label) + '</a>' for path, label in LINKS) + '</nav>'
TEMPLATE = (PUBLIC / 'contact/index.html').read_text()
header = TEMPLATE.split('<body>', 1)[1].split('<main', 1)[0]
footer_match = re.search(r'<footer\b[^>]*class="editorial-footer"[^>]*>[\s\S]*?</footer>', TEMPLATE)
assert footer_match, 'FOOTER_EDITORIAL_ABSENT'
footer = footer_match[0]
footer = re.sub(r'<nav\b[^>]*>[\s\S]*?</nav>', '', footer)
footer = footer.replace('<small>', '<nav aria-label="Découvrir la boutique"><a href="/guides/">Le carnet d’idées</a><a href="/medias/">Médias</a></nav>' + NAV + '<small>', 1)
styles = []
for link in re.findall(r'<link\b[^>]*>', TEMPLATE.split('</head>', 1)[0]):
    if 'rel="stylesheet"' in link and '/legal.css' not in link:
        styles.append(link)
styles.append('<link rel="stylesheet" href="/legal.css">')

def text_html(raw):
    value = escape(raw).replace('\n', '<br>')
    value = value.replace('miniandmerveilles@gmail.com', '<a href="mailto:miniandmerveilles@gmail.com">miniandmerveilles@gmail.com</a>')
    if DATA.get('phonePublicAuthorised') and DATA.get('phonePublic') == '+33785713797':
        value = value.replace('07 85 71 37 97', '<a href="tel:+33785713797">07 85 71 37 97</a>')
    if DATA['mediatorDesignated']:
        for address, target in [('contact@mediationcmfm.fr', 'mailto:contact@mediationcmfm.fr'),
                                ('https://mediationcmfm.eu/consommateur/demande-mediation', 'https://mediationcmfm.eu/consommateur/demande-mediation')]:
            value = value.replace(address, '<a href="' + target + '">' + address + '</a>')
    return value

def body(slug, data):
    out = ['<a href="/informations-legales/">← Toutes les informations</a>' if slug != 'informations-legales' else '<a href="/">← Retour à la boutique</a>',
           '<p class="eyebrow">MINI &amp; MERVEILLES · INFORMATIONS UTILES</p>',
           '<h1>' + escape(data['title']) + '</h1>', '<p>' + text_html(data['intro']) + '</p>']
    if data.get('preparation'):
        out.append('<aside class="legal-notice" aria-label="État de la boutique"><strong>Version de préparation — les ventes restent fermées.</strong><p>' + text_html(PREPARATION_NOTICE) + '</p></aside>')
    if data.get('downloads'):
        out.append('<div class="legal-downloads">' + ''.join('<a href="' + escape(link['href'], quote=True) + '"' + (' download' if link['href'].endswith('.txt') else '') + '>' + escape(link['label']) + '</a>' for link in data['downloads']) + '</div>')
    if slug == 'informations-legales':
        out.append('<nav class="legal-directory" aria-label="Documents et démarches">' + ''.join('<a href="/' + path + '/"><strong>' + escape(label) + '</strong><span>Ouvrir cette page →</span></a>' for path, label in LINKS if path != slug) + '</nav>')
    out.append('<nav class="legal-toc" aria-label="Sommaire de cette page"><ol>' + ''.join('<li><a href="#section-' + str(i) + '">' + escape(s['title']) + '</a></li>' for i, s in enumerate(data['sections'], 1)) + '</ol></nav>')
    out.append('<div class="legal-sections">')
    for i, s in enumerate(data['sections'], 1):
        out.append('<section id="section-' + str(i) + '"><h2>' + escape(s['title']) + '</h2>' + ''.join('<p>' + text_html(p) + '</p>' for p in s['paragraphs']) + '</section>')
    out.append('</div>')
    if data.get('guaranteeBoxText'):
        out.append('<section class="legal-guarantee" aria-labelledby="encadre-garanties"><h2 id="encadre-garanties">Encadré réglementaire français — garanties</h2><p>Vendeur répondant des garanties : BACH Gaëlle — Mini &amp; Merveilles, 7 rue de l’Aramon, 11220 Talairan, France ; <a href="mailto:miniandmerveilles@gmail.com">miniandmerveilles@gmail.com</a>.</p><p>Les repères et l’encadré ci-dessous reproduisent le droit français. Ils ne réduisent pas les protections impératives applicables à un consommateur en Belgique.</p><pre>' + escape(data['guaranteeBoxText']) + '</pre><p><a href="' + escape(data['guaranteeBoxSource'], quote=True) + '">Consulter le texte réglementaire sur Légifrance</a></p></section>')
    if data.get('sources'):
        out.append('<section><h2>Pour consulter les sources officielles</h2><ul>' + ''.join('<li><a href="' + escape(s['url'], quote=True) + '">' + escape(s['label']) + '</a></li>' for s in data['sources']) + '</ul></section>')
    out.append('<p class="legal-updated">Version documentaire : ' + escape(DOCUMENT_DATE) + '. Les informations publiées ne valent pas certification de conformité ni ouverture des ventes.</p>')
    return ''.join(out)

def plain(data):
    chunks = ['MINI & MERVEILLES', data['title'], data['intro'],
              'VERSION DE PRÉPARATION DU ' + DOCUMENT_DATE.upper() + ' — VENTES FERMÉES',
              PREPARATION_NOTICE]
    for sec in data['sections']:
        chunks.extend([sec['title'], *sec['paragraphs']])
    if data.get('guaranteeBoxText'):
        chunks.extend(['ENCADRÉ RÉGLEMENTAIRE FRANÇAIS — GARANTIES',
                       'Vendeur répondant des garanties : BACH Gaëlle, 7 rue de l’Aramon, 11220 Talairan, France ; miniandmerveilles@gmail.com.',
                       'Le droit français reproduit ici ne réduit pas les protections impératives applicables au consommateur belge.',
                       data['guaranteeBoxText'], data['guaranteeBoxSource']])
    return '\n\n'.join(chunks) + '\n'

for slug, data in DATA['pages'].items():
    assert re.fullmatch('[a-z-]+', slug)
    dest = PUBLIC / slug / 'index.html'
    dest.parent.mkdir(parents=True, exist_ok=True)
    title = data['title'] + ' | Mini & Merveilles'
    url = ORIGIN + '/' + slug + '/'
    head = '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escape(title) + '</title><meta name="description" content="' + escape(data['intro'], quote=True) + '"><meta name="robots" content="index,follow"><link rel="canonical" href="' + url + '"><meta property="og:title" content="' + escape(title, quote=True) + '"><meta property="og:description" content="' + escape(data['intro'], quote=True) + '"><meta property="og:url" content="' + url + '"><meta property="og:type" content="website"><meta property="og:image" content="' + ORIGIN + '/media/mini-et-merveilles-partage.png"><link rel="icon" href="/favicon.svg">' + ''.join(styles) + '</head>'
    dest.write_text(head + '<body>' + header + '<main class="legal-page" id="contenu">' + body(slug, data) + '</main>' + footer + '</body></html>\n')

documents = PUBLIC / 'documents'
documents.mkdir(exist_ok=True)
(PUBLIC / CGV_DOWNLOAD_PATH.lstrip('/')).write_text(plain(DATA['pages']['cgv']))
if CGV_DOWNLOAD_PATH != '/documents/cgv-preparation-20261028.txt':
    (documents / 'cgv-preparation-20261028.txt').unlink(missing_ok=True)
form = DATA['pages']['retractation']['sections'][-1]
(documents / 'formulaire-retractation.txt').write_text('MINI & MERVEILLES — FORMULAIRE TYPE DE RÉTRACTATION\n\n' + '\n\n'.join(form['paragraphs']) + '\n\nCe formulaire est facultatif. Toute déclaration non ambiguë est recevable. Signature uniquement pour un envoi papier. Les commandes sont actuellement fermées.\n')

# Les pages natives sont intentionnellement sans hydratation React. L’accueil a
# déjà le même groupe de liens dans son composant source et son bundle qualifié.
linked = 0
for f in PUBLIC.rglob('*.html'):
    html = f.read_text()
    if '<footer' not in html:
        continue
    if 'class="editorial-footer"' in html:
        html = re.sub(r'<footer\b[^>]*class="editorial-footer"[^>]*>[\s\S]*?</footer>', lambda _: footer, html)
    elif 'class="legal-footer-nav"' not in html:
        html = html.replace('</footer>', NAV + '</footer>')
    if '/legal.css' not in html:
        html = html.replace('</head>', '<link rel="stylesheet" href="/legal.css"></head>')
    assert html.count('class="legal-footer-nav"') == 1, str(f)
    f.write_text(html)
    linked += 1

sitemap = PUBLIC / 'sitemap.xml'
xml = sitemap.read_text()
added = 0
for slug in DATA['pages']:
    url = ORIGIN + '/' + slug + '/'
    if '<loc>' + url + '</loc>' not in xml and '<loc>' + url.rstrip('/') + '</loc>' not in xml:
        xml = xml.replace('</urlset>', '<url><loc>' + url + '</loc><lastmod>' + DOCUMENT_DATE_ISO + '</lastmod></url></urlset>')
        added += 1
sitemap.write_text(xml)
print(json.dumps({'documentsHTML': len(DATA['pages']), 'pagesAvecLiens': linked,
                  'documentsTXT': 2, 'nouvellesEntreesSitemap': added,
                  'ventesActivees': False}, ensure_ascii=False))
