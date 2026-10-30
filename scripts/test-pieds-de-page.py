"""Vérifier la structure et les destinations des pieds de page publics."""
from html.parser import HTMLParser
from pathlib import Path
import unittest
from urllib.parse import unquote, urlsplit


PUBLIC = Path(__file__).resolve().parents[1] / 'public'
DISCOVERY = ('/guides/', '/medias/')
LEGAL = ('/informations-legales/', '/cgv/', '/livraison-retours/',
         '/retractation/', '/garanties/', '/mediation/', '/confidentialite/',
         '/cookies/', '/mentions-legales/', '/contact/', '/commande/merci/')
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr'}


class FooterParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.footer = None
        self.nested_links = []

    def handle_starttag(self, tag, attrs):
        if tag != 'footer' and not self.stack:
            return
        if tag == 'a' and any(node['tag'] == 'a' for node in self.stack):
            self.nested_links.append(dict(attrs).get('href'))
        node = {'tag': tag, 'attrs': dict(attrs), 'children': []}
        if self.stack:
            self.stack[-1]['children'].append(node)
        else:
            assert self.footer is None, 'PLUSIEURS_FOOTERS'
            self.footer = node
        if tag not in VOID:
            self.stack.append(node)

    def handle_endtag(self, tag):
        if tag in VOID or not self.stack:
            return
        assert self.stack[-1]['tag'] == tag, 'FOOTER_MAL_FORME: ' + tag
        self.stack.pop()


class FooterTests(unittest.TestCase):
    def test_editorial_navigation(self):
        count = 0
        for page in sorted(PUBLIC.rglob('*.html')):
            parser = FooterParser()
            parser.feed(page.read_text())
            footer = parser.footer
            if not footer or footer['attrs'].get('class') != 'editorial-footer':
                continue
            count += 1
            with self.subTest(page=str(page.relative_to(PUBLIC))):
                self.assertEqual(parser.stack, [], 'Footer non fermé')
                self.assertEqual(parser.nested_links, [], 'Liens imbriqués')
                navs = [node for node in footer['children'] if node['tag'] == 'nav']
                self.assertEqual(len(navs), 2, 'Deux navigations directement sous le footer')
                self.assertEqual(navs[0]['attrs'].get('aria-label'), 'Découvrir la boutique')
                self.assertEqual(navs[1]['attrs'].get('class'), 'legal-footer-nav')
                for nav, expected in zip(navs, (DISCOVERY, LEGAL)):
                    self.assertEqual(tuple(link['attrs'].get('href') for link in nav['children']), expected)
                    self.assertTrue(all(link['tag'] == 'a' for link in nav['children']))
                    for link in nav['children']:
                        href = urlsplit(link['attrs']['href'])
                        self.assertFalse(href.scheme or href.netloc or href.query or href.fragment)
                        target = PUBLIC / unquote(href.path).lstrip('/')
                        self.assertTrue(target.resolve().is_relative_to(PUBLIC.resolve()))
                        self.assertTrue((target / 'index.html').is_file(), link['attrs']['href'])
                brands = [node for node in footer['children']
                          if node['tag'] == 'a' and node['attrs'].get('class') == 'brand']
                self.assertEqual(len(brands), 1)
                self.assertEqual(brands[0]['attrs'].get('href'), '/')
        self.assertEqual(count, 25, 'Toutes les pages éditoriales doivent être contrôlées')


if __name__ == '__main__':
    unittest.main()
