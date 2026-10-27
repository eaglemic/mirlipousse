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

La vitrine présente **30 références fournisseur réelles et leurs photos CJ**, des collections, deux guides et une galerie de **13 médias de présentation**, dont une vidéo. Les anciennes illustrations restent uniquement dans cette galerie, clairement identifiées.

> **Catalogue en préparation : les achats sont fermés.** Les photos des fiches viennent du fournisseur. Les âges, la conformité enfant, les documents fabricant et les conditions de livraison restent à qualifier. Aucun prix client n’est inventé ; le panier est un essai sans paiement.

## Ce que l’on peut déjà explorer

- Parcourir les collections et les idées selon l’âge.
- Chercher et filtrer les produits, consulter leurs photos et leur référence fournisseur. Les âges non documentés restent « à confirmer ».
- Conserver des favoris et un panier de démonstration sur son appareil.
- Lire les guides et découvrir les visuels, la vidéo et leurs téléchargements.
- Profiter du design responsive et des animations du site.
- Donner un avis sur le site : note et commentaire sont conservés côté serveur, puis publiés après modération. Le pseudonyme est facultatif ; aucun achat vérifié n’est prétendu.

## Avant les premières commandes

| Étape | État réel |
| :--- | :--- |
| Vitrine et médias | Présentés dans ce dépôt. |
| Paiement SumUp | Compte existant ; connexion technique et parcours de paiement à qualifier. |
| Fournisseur CJdropshipping | Authentification et paramètres réels vérifiés ; catalogue, détail d’un produit et stock fournisseur positif contrôlés. Service privé authentifié sur Render. |
| Produits, stocks et livraison | Références et photos importées. Stocks observés à la collecte, sans garantie de livraison en France/Belgique ; frais, taxes, conformité et délais à vérifier. |
| Commandes réelles | Fermées ; cet export ne déploie aucune API de paiement ou de commande. |

## Une vitrine légère à publier

Ce dépôt contient l’export statique de la vitrine : **19 pages vitrine, dont la page d’avis, et une page de saisie chiffrée**, les ressources du site et ses médias. Il est préparé pour un hébergement statique sur Render.

```text
public/                  Pages, styles, scripts et médias du site
docs/                    Bannière et aperçu animé du README
scripts/verifier-paquet.py
verification/EXPORT.json Empreintes des fichiers publics
render.yaml              Configuration de publication statique
```

La vitrine publique ne contient aucune clé CJ. Le service fournisseur (`server/`) reste protégé par authentification et n’exécute aucune commande ni paiement. SumUp n’est pas encore raccordé. Les avis utilisent un service durable distinct : aucun avis global n’est simulé dans le stockage local.

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
