# Sources du parcours client Mini & Merveilles

Ce dossier contient seulement le frontend et ses données publiques, sans backend ni ancienne application Sites. Les dépendances sont épinglées aux versions réellement employées dans la recette.

`npm install`, puis `npm run check`, `npm test` et `npm run build` préparent le bundle. Le rendu exige une copie de la vitrine publique **courante** :

```sh
cp -a ../../public /tmp/mirlipousse-parcours-public
npm run render -- ../../public /tmp/mirlipousse-parcours-public
```

Les deux chemins doivent être distincts. Le renderer actualise uniquement l’accueil et le suivi de commande. Il conserve les pages éditoriales, les coordonnées et les autres pages de la vitrine courante. Le manifeste strict doit être recalculé et le circuit de revue/publication suivi avant de remplacer une vitrine. Ne pas reconstruire l’ancien site entier depuis une source antérieure.

`app/lib/pricing-public.json` est la grille indicative publique qualifiée, pas une liste de prix encaissables. Les 30 IDs, PID et VID historiques restent préservés. Le client refuse une ouverture implicite : seul le catalogue API ET un devis qualifié permettent d’afficher les coordonnées. Les ventes de cette remise sont fermées.

Aucune adresse ni téléphone n’est écrit dans localStorage. Les accès privés de tentative sont conservés avant le POST pour reprendre le même paiement et le suivi ; jamais dans une URL. Une réponse incertaine ne crée pas automatiquement une autre tentative. Les états et annulations sont relus côté serveur. Cette version propose uniquement la livraison standard à domicile en France et en Belgique. Mondial Relay reste en attente.

Les tests emploient seulement des données fictives et des réponses réseau locales. Aucun paiement, commande fournisseur ou expédition n’est exercé par ce frontend.
