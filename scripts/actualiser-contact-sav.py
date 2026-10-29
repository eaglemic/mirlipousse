#!/usr/bin/env python3
"""Actualiser uniquement le contact public des vitrines déjà générées et fermées."""
from pathlib import Path
import json
import re
import sys

EMAIL = 'miniandmerveilles@gmail.com'
LINK = '<a href="mailto:' + EMAIL + '">' + EMAIL + '</a>'
FOOTER = '<p class="small" data-contact-sav>Contact &amp; SAV : ' + LINK + '</p>'
CONTACT_OLD = '<section><h2>Un contact à renseigner</h2><p>L’adresse de contact du vendeur n’est pas encore validée. Elle devra être publiée avant l’ouverture commerciale, avec les coordonnées légales requises.</p></section>'
CONTACT_NEW = '<section><h2>Contact &amp; SAV</h2><p>Pour toute question, demande de service après-vente ou de retour : ' + LINK + '. Indiquez le nom de la boutique concernée et, si nécessaire, votre référence de commande.</p></section>'
PRIVACY_OLD = 'Le retrait peut être demandé à l’équipe en indiquant la référence de l’avis. Aucun e-mail ni numéro de téléphone de contact non validé n’est inventé ici.'
PRIVACY_NEW = 'Le retrait peut être demandé à ' + LINK + ' en indiquant le nom de la boutique et la référence de l’avis.'

def update(root):
    public = root / 'public'
    brand = json.loads((public / 'brand.json').read_text())
    assert brand['salesEnabled'] is False
    changed = []
    for path in sorted(public.rglob('*.html')):
        value = original = path.read_text()
        value = re.sub(r'gaelle2027@icloud\.com', EMAIL, value, flags=re.I)
        value = value.replace(CONTACT_OLD, CONTACT_NEW).replace(PRIVACY_OLD, PRIVACY_NEW)
        if 'class="site-footer"' in value and 'data-contact-sav' not in value:
            value = value.replace('</footer>', FOOTER + '</footer>')
        if path.name in ('mentions-legales.html', 'conditions.html', 'retours.html'):
            # Le contact est confirmé ; les autres faits de préparation sont conservés.
            if 'data-contact-page' not in value:
                value = value.replace('</main>', '<p class="section small" data-contact-page>Contact &amp; SAV : ' + LINK + '.</p></main>')
        if value != original:
            path.write_text(value)
            changed.append(str(path.relative_to(root)))
    assert CONTACT_OLD not in (public / 'contact.html').read_text()
    assert CONTACT_NEW in (public / 'contact.html').read_text()
    return {'brand': brand['slug'], 'changed': changed, 'salesEnabled': False}

if __name__ == '__main__':
    print(json.dumps(update(Path(sys.argv[1]).resolve()), ensure_ascii=False))
