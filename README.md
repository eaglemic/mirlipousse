<p align="center">
  <img src="docs/readme-hero.svg" alt="Mirlipousse — les petites grandes découvertes" width="100%">
</p>

<p align="center">
  <strong>Des idées pour jouer, créer et grandir, de 0 à 12 ans.</strong><br>
  Jouets et accessoires pour les familles en France et en Belgique.
</p>

<p align="center">
  <a href="https://mirlipousse.onrender.com"><strong>🌱 Ouvrir Mirlipousse</strong></a>
  &nbsp; · &nbsp;
  <a href="https://mirlipousse.onrender.com/medias"><strong>▶ Découvrir les médias</strong></a>
  &nbsp; · &nbsp;
  <a href="#le-projet"><strong>↓ Le projet</strong></a>
</p>

---

<p align="center">
  <img src="docs/readme-motion.gif" alt="Aperçu animé de l’univers Mirlipousse : couleurs douces, jouets et petites découvertes" width="288">
  <br>
  <sub>Un aperçu animé de 6 secondes. <a href="https://mirlipousse.onrender.com/medias">Voir la vidéo et télécharger les médias</a>.</sub>
</p>

<a id="le-projet"></a>

## Un petit univers à explorer

Mirlipousse prépare une boutique de jouets et d’accessoires pour enfants. Son univers associe papier crème, bois doux, vert sauge et touches de terracotta, avec des animations légères et une navigation pensée pour le téléphone.

| Découvrir | Imaginer | Grandir |
| :--- | :--- | :--- |
| Des idées classées par âge, de 0 à 12 ans. | Des univers de jeu, de création et d’aventure. | Des guides simples pour aider les familles à choisir. |

La vitrine présente **8 concepts illustrés**, des collections par âge, deux guides et une galerie de **13 médias**, dont une vidéo de présentation.

> **Vitrine de démonstration : les achats sont fermés.** Les illustrations présentent des concepts. Elles ne prouvent ni stock disponible, ni fournisseur confirmé, ni conformité ou certification d’un produit.

## Ce que l’on peut déjà explorer

- Parcourir les collections et les idées selon l’âge.
- Chercher et filtrer les concepts, consulter leurs détails.
- Conserver des favoris et un panier de démonstration sur son appareil.
- Lire les guides et découvrir les visuels, la vidéo et leurs téléchargements.
- Profiter du design responsive et des animations du site.

## Avant les premières commandes

| Étape | État réel |
| :--- | :--- |
| Vitrine et médias | Présentés dans ce dépôt. |
| Paiement SumUp | Compte existant ; connexion technique et parcours de paiement à qualifier. |
| Fournisseur CJdropshipping | Compte créé ; autorisation API et catalogue réel à raccorder. |
| Produits, stocks et livraison | À vérifier avec le fournisseur avant ouverture des ventes. |
| Commandes réelles | Fermées ; cet export ne déploie aucune API de paiement ou de commande. |

## Une vitrine légère à publier

Ce dépôt contient l’export statique de la vitrine : **18 pages HTML**, les ressources du site et ses médias. Il est préparé pour un hébergement statique sur Render.

```text
public/                  Pages, styles, scripts et médias du site
docs/                    Bannière et aperçu animé du README
scripts/verifier-paquet.py
verification/EXPORT.json Empreintes des fichiers publics
render.yaml              Configuration de publication statique
```

Le paquet se vérifie avant publication avec :

```sh
python3 scripts/verifier-paquet.py
```

Le contenu publié est uniquement `public/`. Les fichiers du README restent dans le dépôt. Les sauvegardes de code et les vérifications de livraison sont gérées séparément ; aucune donnée client ni clé privée n’a sa place ici.

<details>
<summary><strong>À propos de l’animation de cette page</strong></summary>

Le README utilise un GIF léger, extrait du teaser existant. GitHub ne lance pas les animations JavaScript ou les transitions CSS d’un site dans un README : l’aperçu GIF présente donc le mouvement, tandis que la vitrine propose l’expérience interactive complète.

Le teaser et les visuels restent des supports de présentation. Les éventuelles adresses incrustées dans leurs images ne remplacent pas les liens de navigation affichés dans ce README.

</details>

---

<p align="center">
  <strong>Mirlipousse</strong><br>
  <em>Les petites grandes découvertes.</em><br><br>
  <sub>Créé par <strong>Bach Gaëlle</strong></sub>
</p>
