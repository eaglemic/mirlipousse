/** Contenus originaux Mirlipousse. Catalogue de préparation, aucune offre de vente. */
import type { Product } from "./catalogue";

export type EditorialSection = { title: string; paragraphs: string[] };
export type EditorialSource = { label: string; url: string };
export type CollectionEditorial = {
  slug: string; title: string; description: string; eyebrow: string; intro: string;
  filter: { age?: Product["age"]; category?: Product["category"] };
  sections: EditorialSection[];
  relatedCollectionSlugs: string[];
};
export type GuideEditorial = {
  slug: string; title: string; description: string; eyebrow: string; intro: string;
  sections: EditorialSection[];
  relatedCollectionSlugs: string[];
  sourceLinks: EditorialSource[];
};

export const collections: CollectionEditorial[] = [
  {
    "slug": "jouets-eveil",
    "title": "Jouets d’éveil et jeux de découverte",
    "description": "Des idées de formes, de couleurs et de jeux simples à explorer. Découvrez l’univers éveil de Mirlipousse, avec des repères pour choisir.",
    "eyebrow": "REGARDER · TOUCHER · RECOMMENCER",
    "intro": "Un objet que l’on retourne, une forme qui se cache, une couleur que l’on retrouve : les petits jeux peuvent commencer avec des idées très simples. Cette collection réunit des idées autour des formes, des textures et des gestes du quotidien. Pour choisir, pensez surtout à ce qui attire déjà la curiosité de l’enfant, à la place disponible et à la présence d’un adulte pendant le jeu. Le catalogue présente désormais des références et des photos fournisseur. Les âges présentés sont des repères ; les avertissements du fabricant guideront le choix d’un vrai produit.",
    "filter": {
      "category": "eveil"
    },
    "sections": [
      {
        "title": "Une seule idée à la fois",
        "paragraphs": [
          "Présentez une forme ou un objet, puis laissez le jeu suivre son cours. Il n’est pas nécessaire de multiplier les propositions : regarder, déplacer et recommencer peut déjà devenir une petite histoire partagée."
        ]
      },
      {
        "title": "Garder une place pour la surprise",
        "paragraphs": [
          "Une boîte à ouvrir ou une construction à transformer change la façon d’aborder un même jeu. Pour une référence réelle, les possibilités et les conditions d’utilisation devront être précisées sur sa fiche."
        ]
      }
    ],
    "relatedCollectionSlugs": [
      "0-2ans",
      "3-5ans",
      "jeux-creatifs"
    ]
  },
  {
    "slug": "jeux-creatifs",
    "title": "Jeux créatifs pour les petites et grandes idées",
    "description": "Dessin, couleurs et histoires à inventer : explorez nos idées de jeux créatifs et trouvez une activité qui laisse la place à l’imagination.",
    "eyebrow": "DESSINER · INVENTER · ESSAYER",
    "intro": "Créer n’oblige pas à suivre un modèle parfait. Un carnet peut accueillir une carte au trésor, une page devenir le décor d’une histoire et quelques couleurs donner envie de recommencer autrement. Cet univers rassemble des idées pour les moments où l’on veut fabriquer, dessiner ou imaginer à sa façon. Avant de choisir une activité, regardez le temps disponible, les goûts de l’enfant et ce qui sera facile à ranger. Notre collection est encore en préparation. Les exemples ne sont pas achetables et les repères d’âge ne remplacent pas les indications du fabricant.",
    "filter": {
      "category": "creativite"
    },
    "sections": [
      {
        "title": "Proposer un début, pas un résultat",
        "paragraphs": [
          "« Et si cette feuille devenait une île ? » suffit parfois à lancer une activité. Laissez ensuite l’enfant décider des couleurs, des habitants et de la suite, sans chercher à reproduire votre propre dessin."
        ]
      },
      {
        "title": "Prévoir la fin du petit atelier",
        "paragraphs": [
          "Un support pour protéger la table et un endroit où poser les créations rendent le rangement plus simple. Les matériaux d’un futur coffret devront être vérifiés selon son contenu et son usage."
        ]
      }
    ],
    "relatedCollectionSlugs": [
      "3-5ans",
      "6-8ans",
      "9-12ans"
    ]
  },
  {
    "slug": "jeux-aventure",
    "title": "Jeux d’aventure et histoires à inventer",
    "description": "Fusées, petits mondes et explorations imaginaires : des idées pour transformer un coin de la maison en départ de grande aventure.",
    "eyebrow": "PARTIR · RACONTER · EXPLORER",
    "intro": "Pas besoin de parcourir des kilomètres pour vivre une aventure. Le trajet peut commencer sur une feuille, autour d’une construction ou au départ d’une fusée imaginaire. Cette collection donne une place aux personnages, aux décors et aux histoires que les enfants aiment prolonger. Choisissez une idée qui peut évoluer : un même voyage peut devenir une recherche, une rencontre ou un retour à la maison. Mirlipousse prépare sa sélection pour les familles en France et en Belgique. Les photos fournisseur présentent les références retenues. Les indications d’âge ne sont affichées que lorsqu’elles sont communiquées.",
    "filter": {
      "category": "aventure"
    },
    "sections": [
      {
        "title": "Choisir une petite mission",
        "paragraphs": [
          "Trouver une planète, dessiner un chemin ou construire un refuge donne un point de départ concret. Une mission courte laisse ensuite la possibilité de changer de direction si l’histoire prend une autre tournure."
        ]
      },
      {
        "title": "Faire une aventure à plusieurs voix",
        "paragraphs": [
          "L’un imagine le lieu, l’autre choisit le personnage et chacun ajoute un événement. Pour jouer ensemble, mieux vaut une règle simple que tout le monde comprend qu’un scénario trop long à expliquer."
        ]
      }
    ],
    "relatedCollectionSlugs": [
      "3-5ans",
      "6-8ans",
      "9-12ans"
    ]
  },
  {
    "slug": "accessoires-enfants",
    "title": "Accessoires enfants pour les petites escapades",
    "description": "Sacs, carnets et idées de rangement : découvrez des accessoires de collection pensés autour des petites habitudes et des sorties en famille.",
    "eyebrow": "EMPORTER · RANGER · RETROUVER",
    "intro": "Le petit sac d’une sortie, un carnet pour les idées ou un rangement pour les affaires des parents : les accessoires accompagnent aussi les histoires du quotidien. Pour les choisir, partez d’une situation précise plutôt que d’une longue liste d’objets. Que faut-il emporter ? Qui utilisera l’accessoire ? Où sera-t-il rangé au retour ? Les références présentées sont réelles, mais leur vente n’est pas encore ouverte. Les dimensions, matières, réglages et précautions seront détaillés sur les futures fiches. Un accessoire de rangement destiné aux parents n’est pas automatiquement un jouet pour l’enfant.",
    "filter": {
      "category": "quotidien"
    },
    "sections": [
      {
        "title": "Penser à l’usage avant au motif",
        "paragraphs": [
          "Pour un sac, regardez ce qu’il devra contenir et la façon dont il s’ouvre. Pour un carnet, demandez-vous s’il restera à la maison ou s’il accompagnera les promenades. Un détail pratique compte autant que la couleur."
        ]
      },
      {
        "title": "Séparer les affaires des grands et des petits",
        "paragraphs": [
          "Certains rangements sont faits pour être manipulés par un adulte. La fiche d’une référence réelle devra préciser son destinataire et ses précautions, notamment lorsqu’elle comporte des cordons ou des petites pièces."
        ]
      }
    ],
    "relatedCollectionSlugs": [
      "0-2ans",
      "6-8ans",
      "9-12ans"
    ]
  },
  {
    "slug": "0-2ans",
    "title": "Idées de jeux et accessoires pour les 0–2 ans",
    "description": "Un premier univers de formes, de découvertes et d’accessoires parents. Des idées à explorer, avec une attention particulière aux indications réelles.",
    "eyebrow": "LES PREMIÈRES PETITES HISTOIRES",
    "intro": "Entre la naissance et les premières années, les envies et les façons de jouer changent beaucoup. Cette catégorie aide à explorer un univers de formes simples, de couleurs et de petits moments partagés, sans supposer qu’un même objet convient à tous les enfants de zéro à deux ans. Regardez le destinataire exact : certains concepts sont des jeux, d’autres des accessoires réservés aux parents. Le catalogue est en préparation ; aucune aptitude dès la naissance n’est déduite d’une photo. Pour toute référence future, l’âge d’utilisation et les avertissements du fabricant resteront déterminants.",
    "filter": {
      "age": "0-2"
    },
    "sections": [
      {
        "title": "Privilégier un choix précis",
        "paragraphs": [
          "Au lieu de chercher un objet qui ferait tout, partez d’un moment concret : un jeu accompagné à la maison ou le rangement des affaires par un parent. Cela aide à distinguer les besoins et les usages."
        ]
      },
      {
        "title": "Ne pas confondre décor, rangement et jeu",
        "paragraphs": [
          "Un joli pochon ou un objet décoratif ne devient pas un jouet parce qu’il figure dans un univers enfant. Les fiches définitives distingueront ces fonctions et les conditions d’utilisation de chaque référence."
        ]
      }
    ],
    "relatedCollectionSlugs": [
      "jouets-eveil",
      "accessoires-enfants",
      "3-5ans"
    ]
  },
  {
    "slug": "3-5ans",
    "title": "Idées de jeux pour les enfants de 3–5 ans",
    "description": "Construire une histoire, mélanger des couleurs ou inventer un petit monde : explorez des idées de jeux pour accompagner leurs envies.",
    "eyebrow": "LES HISTOIRES PRENNENT PLACE",
    "intro": "Une construction peut devenir un garage, puis un château quelques minutes plus tard. Pour les enfants de trois à cinq ans, on peut chercher des idées qui laissent une place aux histoires, aux essais et aux changements de règles. Pensez à ce que l’enfant aime déjà faire : empiler, raconter, dessiner ou jouer à plusieurs. La durée d’une activité et l’espace nécessaire comptent aussi dans le choix. Cette collection Mirlipousse présente des références fournisseur en cours de vérification. La catégorie est un repère de navigation, et non une validation d’âge pour les futurs produits fournisseur.",
    "filter": {
      "age": "3-5"
    },
    "sections": [
      {
        "title": "Des règles qui tiennent en quelques mots",
        "paragraphs": [
          "Construire un pont ou dessiner la maison d’un personnage donne un objectif compréhensible. Laissez la suite ouverte : le chemin inventé peut compter davantage que l’objet terminé."
        ]
      },
      {
        "title": "Prévoir un jeu qui peut s’arrêter",
        "paragraphs": [
          "Une activité facile à reprendre permet de garder une construction ou un dessin pour plus tard. Choisissez un rangement simple et annoncez la fin du jeu avec une petite dernière étape."
        ]
      }
    ],
    "relatedCollectionSlugs": [
      "jouets-eveil",
      "jeux-creatifs",
      "jeux-aventure"
    ]
  },
  {
    "slug": "6-8ans",
    "title": "Idées créatives et jeux pour les 6–8 ans",
    "description": "Petits projets, histoires et découvertes : des idées pour laisser les enfants choisir une aventure, puis lui donner leur propre forme.",
    "eyebrow": "LES IDÉES PRENNENT LE LARGE",
    "intro": "Une carte à dessiner, un voyage à inventer ou une construction à transformer : les idées peuvent prendre la forme de petits projets. Pour les enfants de six à huit ans, commencez par une envie concrète et proposez quelques possibilités plutôt qu’un programme trop chargé. Certains préféreront créer seuls, d’autres partager une mission ou un atelier. Aucun de ces choix n’est une obligation liée à l’âge. Mirlipousse prépare une collection qui laisse cette liberté. Les prix ne sont pas encore proposés ; les caractéristiques et indications d’usage définitives seront celles du produit réellement retenu.",
    "filter": {
      "age": "6-8"
    },
    "sections": [
      {
        "title": "Un projet à la bonne taille",
        "paragraphs": [
          "Inventer trois étapes pour une expédition ou remplir une page de carnet donne un début et une fin visibles. Rien n’empêche d’ajouter un chapitre lorsque l’envie est encore là."
        ]
      },
      {
        "title": "Laisser choisir une partie de l’activité",
        "paragraphs": [
          "La destination d’un voyage, la couleur d’un dessin ou le rôle d’un personnage peuvent être décidés par l’enfant. Le même support devient alors le point de départ de projets différents."
        ]
      }
    ],
    "relatedCollectionSlugs": [
      "jeux-creatifs",
      "jeux-aventure",
      "accessoires-enfants"
    ]
  },
  {
    "slug": "9-12ans",
    "title": "Idées de loisirs et accessoires pour les 9–12 ans",
    "description": "Carnets, projets créatifs et petites aventures : des idées pour respecter leurs goûts et leur laisser la place de faire à leur manière.",
    "eyebrow": "LEURS ENVIES, LEURS PROJETS",
    "intro": "Les goûts deviennent parfois plus précis, mais l’envie de jouer ne suit pas un calendrier unique. Pour les enfants de neuf à douze ans, demandez ce qui les attire : imaginer un récit, dessiner, préparer une sortie ou garder la trace de leurs idées. Un accessoire ou un support simple peut trouver sa place dans plusieurs projets, sans imposer une activité déjà écrite. Cette collection est encore en préparation. Les références présentées sont en préparation ; elles ne sont pas des offres de vente disponibles. Les indications et précautions d’une vraie référence devront toujours être consultées.",
    "filter": {
      "age": "9-12"
    },
    "sections": [
      {
        "title": "Choisir avec l’enfant",
        "paragraphs": [
          "Une discussion sur ses dernières idées est souvent plus utile qu’une sélection fondée uniquement sur son âge. Préférez quelques options concrètes et laissez une place à ses propres propositions."
        ]
      },
      {
        "title": "Un support, plusieurs façons de s’en servir",
        "paragraphs": [
          "Un carnet peut accueillir une bande dessinée, les plans d’un décor ou la liste d’une expédition imaginaire. Le contenu n’a pas besoin d’être terminé en une seule séance pour avoir de l’intérêt."
        ]
      }
    ],
    "relatedCollectionSlugs": [
      "jeux-creatifs",
      "jeux-aventure",
      "accessoires-enfants"
    ]
  }
];

export const guidesArray: GuideEditorial[] = [
  {
    "slug": "choisir-un-jouet-selon-age",
    "title": "Comment choisir un jouet selon l’âge de l’enfant ?",
    "description": "Des repères simples pour partir des goûts de l’enfant, comprendre les catégories d’âge et lire les informations utiles avant de choisir un jouet.",
    "eyebrow": "LE GUIDE DES PETITES DÉCOUVERTES",
    "intro": "L’âge est un point de départ, pas une réponse à lui seul. Deux enfants du même âge peuvent avoir envie de jeux très différents, ou aborder un même objet à leur manière. Pour faire un choix, on peut croiser trois questions simples : qu’aime déjà l’enfant, comment souhaite-t-il jouer et quelles sont les conditions d’utilisation du produit ? Ce guide propose une méthode pratique, sans classement des enfants ni promesse de résultat. Les collections Mirlipousse sont en préparation ; les indications d’une vraie fiche produit devront toujours être vérifiées.",
    "sections": [
      {
        "title": "1. Regarder ce qui lui plaît déjà",
        "paragraphs": [
          "Avant de chercher une nouveauté, observez les jeux qui reviennent souvent. L’enfant préfère-t-il raconter une histoire, empiler des formes ou remplir une page de couleurs ? Partez d’un détail de ce jeu familier pour ouvrir une autre possibilité. Une construction peut devenir un décor, par exemple. L’objectif n’est pas de lui attribuer un profil, mais de choisir une proposition qu’il aura envie de découvrir, seul ou avec quelqu’un."
        ]
      },
      {
        "title": "2. Vérifier comment le jeu sera utilisé",
        "paragraphs": [
          "Le lieu, le temps et la présence d’un adulte changent beaucoup la situation. Un grand projet à laisser sur une table ne répond pas au même besoin qu’une activité courte à ranger après le goûter. Dans les premières années, distinguez bien un jouet d’un accessoire destiné aux parents. Pensez aussi à la personne qui installera, manipulera et rangera l’objet : ce sont des détails concrets, utiles avant de choisir."
        ]
      },
      {
        "title": "3. Faire évoluer l’idée sans imposer un rythme",
        "paragraphs": [
          "Dans l’univers trois à cinq ans, une mission courte peut ouvrir une histoire très libre. Plus tard, certains enfants apprécieront un projet en plusieurs étapes, un carnet ou un jeu à partager. Ce sont des pistes, pas des étapes obligatoires à atteindre à une date précise. Si l’enfant préfère revenir à un jeu connu, vous pouvez simplement en changer le décor, ajouter un personnage ou lui demander d’inventer une nouvelle règle."
        ]
      },
      {
        "title": "4. Lire la fiche du produit réel",
        "paragraphs": [
          "Une catégorie « six à huit ans » organise une collection ; elle ne remplace pas l’âge d’utilisation ni les avertissements du fabricant. Avant un achat réel, consultez les précautions et le contenu exact. La DGCCRF recommande de choisir un jouet adapté à l’enfant et de vérifier les informations de sécurité. Chez Mirlipousse, une photo fournisseur ne prouve ni conformité ni aptitude à un âge particulier."
        ]
      }
    ],
    "relatedCollectionSlugs": [
      "0-2ans",
      "3-5ans",
      "6-8ans",
      "9-12ans"
    ],
    "sourceLinks": [
      {
        "label": "DGCCRF · Choisir un jouet adapté à l’âge de l’enfant",
        "url": "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/securite-des-jouets-optez-pour-un-produit-adapte-lage-de-lenfant"
      }
    ]
  },
  {
    "slug": "idees-jeux-creatifs-sans-ecran",
    "title": "Des idées de jeux créatifs sans écran, faciles à adapter",
    "description": "Une ville à inventer, une carte à dessiner et une histoire à partager : quatre pistes concrètes pour préparer un moment créatif à la maison.",
    "eyebrow": "PLACE AUX IDÉES QUI DÉBORDENT",
    "intro": "Un moment créatif peut commencer avec une consigne très courte : inventer un lieu, choisir un personnage ou dessiner la suite d’une histoire. Il ne demande pas forcément un atelier complet ni un résultat à exposer. Les pistes ci-dessous se déclinent selon les goûts de l’enfant, le temps disponible et le matériel déjà choisi pour son usage. Elles invitent à essayer, changer d’avis et recommencer. Les produits Mirlipousse sont en cours de vérification ; leurs photos ne remplacent pas la vérification des âges et des conditions d’utilisation d’un matériel réel.",
    "sections": [
      {
        "title": "1. Préparer un coin simple à retrouver",
        "paragraphs": [
          "Choisissez une petite surface, un rangement pour le matériel et une place pour les créations en cours. Proposez deux ou trois options au lieu de tout sortir. L’enfant peut décider de ce qu’il veut utiliser, dans le cadre du matériel déjà retenu par l’adulte. Prévoyez aussi une fin facile : une page terminée, une étape de l’histoire ou une création que l’on met de côté pour la reprendre un autre jour."
        ]
      },
      {
        "title": "2. Inventer une ville qui change de forme",
        "paragraphs": [
          "Avec un jeu de construction adapté à son usage, commencez par un lieu : une maison, une place ou une station pour les voyageurs imaginaires. Demandez ensuite ce qui manque à cette ville. Un chemin ? Un personnage ? Un endroit où se retrouver ? Chacun peut ajouter une idée et expliquer son rôle. Si la construction change ou tombe, l’histoire peut aussi changer : il n’y a pas de modèle unique à réussir."
        ]
      },
      {
        "title": "3. Dessiner une carte de petite aventure",
        "paragraphs": [
          "Sur une feuille ou dans un carnet, imaginez un départ, une arrivée et trois lieux entre les deux. Donnez-leur des noms amusants, puis choisissez une façon de les rejoindre. On peut raconter le trajet à voix haute, ajouter une météo inventée ou dessiner le personnage qui attend à l’arrivée. Pour une activité courte, gardez un seul passage. Pour continuer plus tard, laissez une case vide où commencer la prochaine aventure."
        ]
      },
      {
        "title": "4. Faire tourner les idées entre les joueurs",
        "paragraphs": [
          "Une personne choisit le décor, une autre ajoute le personnage et la suivante imagine un événement. Après un tour, échangez les rôles ou proposez une fin différente. Cette formule fonctionne aussi à deux, en alternant les idées. L’adulte peut participer sans corriger chaque détail. Gardez surtout le plaisir de raconter quelque chose ensemble. Ces propositions sont des loisirs, sans objectif scolaire ou résultat de développement garanti, à adapter aux participants et au matériel."
        ]
      }
    ],
    "relatedCollectionSlugs": [
      "jeux-creatifs",
      "jeux-aventure",
      "6-8ans",
      "9-12ans"
    ],
    "sourceLinks": [
      {
        "label": "DGCCRF · Informations de sécurité et choix du jouet",
        "url": "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/securite-des-jouets-optez-pour-un-produit-adapte-lage-de-lenfant"
      }
    ]
  }
];
