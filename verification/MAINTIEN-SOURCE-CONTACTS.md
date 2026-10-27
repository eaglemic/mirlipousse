# Maintien des contacts lors d’un prochain build React

Le paquet public conserve tous les bundles React et les 30 fiches exactement identiques. Les pages éditoriales sont du HTML natif, sans hydratation. La bande de contact de l’accueil est placée après la racine `mirlipousse-root`, donc hors du sous-arbre contrôlé par React.

Le prochain générateur d’export doit reprendre la bande HTML `aside.public-contact-band` et `/contact.css` depuis cet export canonique, ou ajouter leur équivalent source dans `render-home-avis.tsx`. Ajouter le lien `/contact/` à `EditorialFooter` pour les futurs rendus. Reprendre les textes canoniques de `mentions-legales`, `confidentialite`, `livraison-retours`, `ouverture` et la nouvelle page `contact` avant toute reconstruction globale.

L’archive SOURCE-MOTION contient une ancienne variante source de `confidentialite/page.tsx` qui précède les avis persistants. Elle n’est pas utilisée pour régénérer la confidentialité dans ce lot. Ne pas écraser les informations actuelles des avis avec ce texte historique.

Le formulaire d’avis garde la même API D1/version 6, les mêmes consentements et la modération. Le nouveau lien e-mail n’effectue aucune suppression ni envoi automatique.
