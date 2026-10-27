"""Refuser un export incomplet ou altéré avant sa publication statique."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parents[1]
proof = json.loads((root / 'verification/EXPORT.json').read_text())
if proof['succes'] is not True or proof['pagesHTML'] != 18:
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
print('Export statique vérifié : 18 pages ; aucune API ni vente activée.')
