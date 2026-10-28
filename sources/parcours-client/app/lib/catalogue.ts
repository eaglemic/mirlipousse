/** Généré depuis le catalogue fournisseur épinglé. Aucun prix client ni achat activé. */
import pricing from "./pricing-public.json";
import ageEvidence from "./age-evidence-public.json";
import {readAgeEvidence,type AgeCoverage} from "../age-groups";
export type Product = {ageKnown?:boolean;ageGroups?:string[];ageGroupCoverage?:AgeCoverage[];ageSource?:string;ageEvidenceStatus?:string;indicativePriceCents?:number|null;priceStatus?:string;priceLabel?:string;catalogueCategory?:string;catalogueCategoryLabel?:string;variants?:{id:string;label:string;availableForCheckout:boolean}[];id:string; name:string; subtitle:string; category:'eveil'|'creativite'|'aventure'|'quotidien'; age:'0-2'|'3-5'|'6-8'|'9-12'|null; ageLabel:string; priceCents:null; image:string; color:string; description:string; details:string[]; demo:false; supplierProductId:string; supplierVariantId:string;};
const baseProducts: Product[] = [
  {
    "id": "cj-1443498935560835072",
    "name": "Kit de fouille de pierres et gemmes",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/1443498935560835072.webp",
    "color": "#f4f2ed",
    "description": "Un coffret de fouille avec un bloc à creuser et des accessoires pour découvrir les pierres proposées par le fournisseur.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Pierres et accessoires en plastique mentionnés dans la description ; composition complète non documentée.",
      "Référence fournisseur CJ : 1443498935560835072"
    ],
    "demo": false,
    "supplierProductId": "1443498935560835072",
    "supplierVariantId": "1443498935623749632"
  },
  {
    "id": "cj-2407170610431615300",
    "name": "Sac bandoulière fraise pour enfant",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/2407170610431615300.webp",
    "color": "#f4f2ed",
    "description": "Un petit sac en forme de fraise, avec une bandoulière et une fermeture. La photo correspond à la variante rouge contrôlée.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : EVA et polyester mentionnés par le fournisseur ; composition à confirmer.",
      "Référence fournisseur CJ : 2407170610431615300"
    ],
    "demo": false,
    "supplierProductId": "2407170610431615300",
    "supplierVariantId": "2407170610431615500"
  },
  {
    "id": "cj-1768205411733221376",
    "name": "Sac tressé pour enfant",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/1768205411733221376.webp",
    "color": "#f4f2ed",
    "description": "Un sac tressé avec une bandoulière, présenté par le fournisseur comme un accessoire pour enfant.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Paille, selon la description fournisseur.",
      "Référence fournisseur CJ : 1768205411733221376"
    ],
    "demo": false,
    "supplierProductId": "1768205411733221376",
    "supplierVariantId": "1768205411821301760"
  },
  {
    "id": "cj-1677148647701618688",
    "name": "Sac à dos léger à motif pour enfant",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/1677148647701618688.webp",
    "color": "#f4f2ed",
    "description": "Un sac à dos à motif pour enfant. La fiche fournisseur indique un tissu nylon et une doublure polyester.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Nylon et doublure polyester, selon la description fournisseur.",
      "Référence fournisseur CJ : 1677148647701618688"
    ],
    "demo": false,
    "supplierProductId": "1677148647701618688",
    "supplierVariantId": "1677148647789699072"
  },
  {
    "id": "cj-28d791f0-e7f4-4f7c-b9a1-9c4bd728c047",
    "name": "Sac à dos dinosaure",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/28d791f0-e7f4-4f7c-b9a1-9c4bd728c047.webp",
    "color": "#f4f2ed",
    "description": "Un sac à dos à motif dinosaure. La fiche fournisseur indique un tissu Oxford et une doublure polyester.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Tissu Oxford et doublure polyester, selon la description fournisseur.",
      "Référence fournisseur CJ : 28D791F0-E7F4-4F7C-B9A1-9C4BD728C047"
    ],
    "demo": false,
    "supplierProductId": "28D791F0-E7F4-4F7C-B9A1-9C4BD728C047",
    "supplierVariantId": "0A7A86F9-1B74-42BA-98EB-CB04451DAA77"
  },
  {
    "id": "cj-90e2c080-d1cf-414b-9b38-74fe6f8709d8",
    "name": "Sac à dos panda en peluche",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/90e2c080-d1cf-414b-9b38-74fe6f8709d8.webp",
    "color": "#f4f2ed",
    "description": "Un sac à dos en forme de panda, présenté en peluche courte avec un rembourrage décrit par le fournisseur.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Peluche courte ; remplissage indiqué « PP cotton » par le fournisseur, composition à confirmer.",
      "Référence fournisseur CJ : 90E2C080-D1CF-414B-9B38-74FE6F8709D8"
    ],
    "demo": false,
    "supplierProductId": "90E2C080-D1CF-414B-9B38-74FE6F8709D8",
    "supplierVariantId": "46D28A43-6921-400B-96B2-AF02ED096FED"
  },
  {
    "id": "cj-d4a2c882-1da7-459a-9b7f-06044f3e381a",
    "name": "Petit sac à dos à motif pour enfant",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/d4a2c882-1da7-459a-9b7f-06044f3e381a.webp",
    "color": "#f4f2ed",
    "description": "Un petit sac à dos à fermeture zippée, proposé avec plusieurs motifs animaux. La photo correspond à la variante contrôlée.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière décrite comme « diving material » par le fournisseur ; composition non précisée.",
      "Référence fournisseur CJ : D4A2C882-1DA7-459A-9B7F-06044F3E381A"
    ],
    "demo": false,
    "supplierProductId": "D4A2C882-1DA7-459A-9B7F-06044F3E381A",
    "supplierVariantId": "18260993-F15E-4055-AE7A-038816033390"
  },
  {
    "id": "cj-2507060525441623500",
    "name": "Pull enfant à motif brodé",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/2507060525441623500.webp",
    "color": "#f4f2ed",
    "description": "Un pull enfant à manches longues et motif brodé. Les tailles fournisseur doivent être vérifiées avant toute vente.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Fibre d’alcool polyvinylique (Vinylon) indiquée par le fournisseur ; étiquette de composition à confirmer.",
      "Référence fournisseur CJ : 2507060525441623500"
    ],
    "demo": false,
    "supplierProductId": "2507060525441623500",
    "supplierVariantId": "2507060525441623700"
  },
  {
    "id": "cj-0371a284-5c24-49ec-900a-59d7c824c310",
    "name": "Sous-vêtements thermiques pour enfant",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/0371a284-5c24-49ec-900a-59d7c824c310.webp",
    "color": "#f4f2ed",
    "description": "Un ensemble textile enfant à manches longues et motif rayé. Les tailles et la composition doivent être confirmées avant toute vente.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Polyester indiqué par le fournisseur ; étiquette de composition à confirmer.",
      "Référence fournisseur CJ : 0371A284-5C24-49EC-900A-59D7C824C310"
    ],
    "demo": false,
    "supplierProductId": "0371A284-5C24-49EC-900A-59D7C824C310",
    "supplierVariantId": "13DBA1A0-F46D-4B91-92DA-75E389037D5A"
  },
  {
    "id": "cj-1402446458522832896",
    "name": "Sac à dos à oreilles de lapin",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/1402446458522832896.webp",
    "color": "#f4f2ed",
    "description": "Un sac à dos avec des oreilles de lapin et un nœud décoratif. La photo correspond à la variante bleue contrôlée.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Composition non renseignée dans les données reçues.",
      "Référence fournisseur CJ : 1402446458522832896"
    ],
    "demo": false,
    "supplierProductId": "1402446458522832896",
    "supplierVariantId": "1402446460066336768"
  },
  {
    "id": "cj-1399662745170874368",
    "name": "Petit sac à dos fraise pour enfant",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/1399662745170874368.webp",
    "color": "#f4f2ed",
    "description": "Un petit sac à dos enfant à motif fraise sur la photo de la variante rose contrôlée. La fiche fournisseur indique une doublure polyester.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Doublure polyester indiquée par le fournisseur ; matière extérieure non précisée.",
      "Référence fournisseur CJ : 1399662745170874368"
    ],
    "demo": false,
    "supplierProductId": "1399662745170874368",
    "supplierVariantId": "1399662746596937728"
  },
  {
    "id": "mirlipousse-cj-6803c9e5-7539-4e9d-b1a3-8b3bd8c92b63",
    "name": "Puzzle en bois animaux de la ferme",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/6803c9e5-7539-4e9d-b1a3-8b3bd8c92b63.webp",
    "color": "#f4f2ed",
    "description": "Puzzle en bois animaux de la ferme. Matière déclarée par le fournisseur : splint Warning slogan.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : splint Warning slogan.",
      "Référence fournisseur CJ : 6803C9E5-7539-4E9D-B1A3-8B3BD8C92B63"
    ],
    "demo": false,
    "supplierProductId": "6803C9E5-7539-4E9D-B1A3-8B3BD8C92B63",
    "supplierVariantId": "0AB1A691-F69E-4719-9A0F-139F78B47E08"
  },
  {
    "id": "mirlipousse-cj-1382549875220156416",
    "name": "Puzzle chiffres et animaux",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/1382549875220156416.webp",
    "color": "#f4f2ed",
    "description": "Puzzle chiffres et animaux. Matière déclarée par le fournisseur : Wooden Specification.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : Wooden Specification.",
      "Référence fournisseur CJ : 1382549875220156416"
    ],
    "demo": false,
    "supplierProductId": "1382549875220156416",
    "supplierVariantId": "1382549876826574848"
  },
  {
    "id": "mirlipousse-cj-2406150900481611300",
    "name": "Jeu de réflexion parent-enfant",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/2406150900481611300.webp",
    "color": "#f4f2ed",
    "description": "Jeu de réflexion parent-enfant. Matière déclarée par le fournisseur : EVA.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : EVA.",
      "Référence fournisseur CJ : 2406150900481611300"
    ],
    "demo": false,
    "supplierProductId": "2406150900481611300",
    "supplierVariantId": "2406150900481611500"
  },
  {
    "id": "mirlipousse-cj-7d9cb8a7-0917-47fc-825e-c26cab320373",
    "name": "Jeu d’encastrement de cylindres en bois",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/7d9cb8a7-0917-47fc-825e-c26cab320373.webp",
    "color": "#f4f2ed",
    "description": "Un jeu d’encastrement de cylindres en bois de tailles différentes. Aucun label pédagogique ou certification Montessori n’est revendiqué.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : wood.",
      "Référence fournisseur CJ : 7D9CB8A7-0917-47FC-825E-C26CAB320373"
    ],
    "demo": false,
    "supplierProductId": "7D9CB8A7-0917-47FC-825E-C26CAB320373",
    "supplierVariantId": "1493119457873235968"
  },
  {
    "id": "mirlipousse-cj-a98eba8c-80a7-4027-b33d-45fe2d33dbc8",
    "name": "Bandes de papier pour étoiles en origami",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/a98eba8c-80a7-4027-b33d-45fe2d33dbc8.webp",
    "color": "#f4f2ed",
    "description": "Bandes de papier pour étoiles en origami. Composition à confirmer avant vente.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Composition à confirmer avant vente.",
      "Référence fournisseur CJ : A98EBA8C-80A7-4027-B33D-45FE2D33DBC8"
    ],
    "demo": false,
    "supplierProductId": "A98EBA8C-80A7-4027-B33D-45FE2D33DBC8",
    "supplierVariantId": "0AD9F24B-3113-40D2-B0B9-913CEE69BA4C"
  },
  {
    "id": "mirlipousse-cj-2410260314571602100",
    "name": "Ciseaux de loisirs créatifs en plastique",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/2410260314571602100.webp",
    "color": "#f4f2ed",
    "description": "Ciseaux de loisirs créatifs en plastique. Matière déclarée par le fournisseur : ABS.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : ABS.",
      "Référence fournisseur CJ : 2410260314571602100"
    ],
    "demo": false,
    "supplierProductId": "2410260314571602100",
    "supplierVariantId": "2410260314571602300"
  },
  {
    "id": "mirlipousse-cj-1765008428654661632",
    "name": "Seau de plage en silicone",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/1765008428654661632.webp",
    "color": "#f4f2ed",
    "description": "Seau de plage en silicone. Matière déclarée par le fournisseur : Silicone Quantity.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : Silicone Quantity.",
      "Référence fournisseur CJ : 1765008428654661632"
    ],
    "demo": false,
    "supplierProductId": "1765008428654661632",
    "supplierVariantId": "1765008428730159104"
  },
  {
    "id": "mirlipousse-cj-ffd645ea-e4eb-4976-9c8e-80cc0b436c6a",
    "name": "Blocs de construction en arc-en-ciel",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/ffd645ea-e4eb-4976-9c8e-80cc0b436c6a.webp",
    "color": "#f4f2ed",
    "description": "Blocs de construction en arc-en-ciel. Matière déclarée par le fournisseur : wooden Paint material.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : wooden Paint material.",
      "Référence fournisseur CJ : FFD645EA-E4EB-4976-9C8E-80CC0B436C6A"
    ],
    "demo": false,
    "supplierProductId": "FFD645EA-E4EB-4976-9C8E-80CC0B436C6A",
    "supplierVariantId": "F4330554-F70F-401D-B37F-EDE0B19D4BD5"
  },
  {
    "id": "mirlipousse-cj-2406150930491617200",
    "name": "Fusée à empiler en silicone",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/2406150930491617200.webp",
    "color": "#f4f2ed",
    "description": "Fusée à empiler en silicone. Matière déclarée par le fournisseur : Edible Silicon Category.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : Edible Silicon Category.",
      "Référence fournisseur CJ : 2406150930491617200"
    ],
    "demo": false,
    "supplierProductId": "2406150930491617200",
    "supplierVariantId": "2406150930491617700"
  },
  {
    "id": "mirlipousse-cj-1695327556238581760",
    "name": "Jeu d’équilibre animaux",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/1695327556238581760.webp",
    "color": "#f4f2ed",
    "description": "Des pièces en forme d’animaux à placer en équilibre. Aucun rattachement à une marque de jeu n’est revendiqué.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : Wooden.",
      "Référence fournisseur CJ : 1695327556238581760"
    ],
    "demo": false,
    "supplierProductId": "1695327556238581760",
    "supplierVariantId": "1695327556309884928"
  },
  {
    "id": "mirlipousse-cj-1728960399522926592",
    "name": "Trousse de rangement portable",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/1728960399522926592.webp",
    "color": "#f4f2ed",
    "description": "Trousse de rangement portable. Matière déclarée par le fournisseur : Little Oxford Capacity.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : Little Oxford Capacity.",
      "Référence fournisseur CJ : 1728960399522926592"
    ],
    "demo": false,
    "supplierProductId": "1728960399522926592",
    "supplierVariantId": "1728960399590035456"
  },
  {
    "id": "mirlipousse-cj-1796776735170637824",
    "name": "Trousse de rangement à compartiments",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/1796776735170637824.webp",
    "color": "#f4f2ed",
    "description": "Trousse de rangement à compartiments. Matière déclarée par le fournisseur : pu.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : pu.",
      "Référence fournisseur CJ : 1796776735170637824"
    ],
    "demo": false,
    "supplierProductId": "1796776735170637824",
    "supplierVariantId": "1796776735258718208"
  },
  {
    "id": "mirlipousse-cj-2406260653231601900",
    "name": "Trousse transparente à motif",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/2406260653231601900.webp",
    "color": "#f4f2ed",
    "description": "Trousse de rangement à fermeture. Le fournisseur précise que la peluche panda visible sur certaines photos est un accessoire de présentation non inclus.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : Polyester.",
      "Référence fournisseur CJ : 2406260653231601900"
    ],
    "demo": false,
    "supplierProductId": "2406260653231601900",
    "supplierVariantId": "2406260653231602300"
  },
  {
    "id": "mirlipousse-cj-2411100316571609400",
    "name": "Petit tableau de dessin effaçable",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/2411100316571609400.webp",
    "color": "#f4f2ed",
    "description": "Petit tableau de dessin effaçable. Composition à confirmer avant vente.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Composition à confirmer avant vente.",
      "Référence fournisseur CJ : 2411100316571609400"
    ],
    "demo": false,
    "supplierProductId": "2411100316571609400",
    "supplierVariantId": "2411100316571609600"
  },
  {
    "id": "mirlipousse-cj-1726049085276303360",
    "name": "Livre de dessin à plusieurs faces",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/1726049085276303360.webp",
    "color": "#f4f2ed",
    "description": "Livre de dessin à plusieurs faces. Matière déclarée par le fournisseur : PVC Name.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : PVC Name.",
      "Référence fournisseur CJ : 1726049085276303360"
    ],
    "demo": false,
    "supplierProductId": "1726049085276303360",
    "supplierVariantId": "1726049085376966656"
  },
  {
    "id": "mirlipousse-cj-1824293787209191424",
    "name": "Trousse dépliable à compartiments",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/1824293787209191424.webp",
    "color": "#f4f2ed",
    "description": "Trousse dépliable à compartiments. Composition à confirmer avant vente.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Composition à confirmer avant vente.",
      "Référence fournisseur CJ : 1824293787209191424"
    ],
    "demo": false,
    "supplierProductId": "1824293787209191424",
    "supplierVariantId": "1824293787347603456"
  },
  {
    "id": "mirlipousse-cj-2412090236531628600",
    "name": "Trousse transparente avec poignée",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/2412090236531628600.webp",
    "color": "#f4f2ed",
    "description": "Trousse transparente avec poignée. Matière déclarée par le fournisseur : Polyester.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : Polyester.",
      "Référence fournisseur CJ : 2412090236531628600"
    ],
    "demo": false,
    "supplierProductId": "2412090236531628600",
    "supplierVariantId": "2412090236531628700"
  },
  {
    "id": "mirlipousse-cj-2508141412481628100",
    "name": "Trousse en tissu à nœud",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/2508141412481628100.webp",
    "color": "#f4f2ed",
    "description": "Trousse en tissu à nœud. Matière déclarée par le fournisseur : polyester cotton.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : polyester cotton.",
      "Référence fournisseur CJ : 2508141412481628100"
    ],
    "demo": false,
    "supplierProductId": "2508141412481628100",
    "supplierVariantId": "2508141412481628300"
  },
  {
    "id": "mirlipousse-cj-2406200657031625700",
    "name": "Trousse en forme de poisson",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge à confirmer",
    "priceCents": null,
    "image": "/media/catalogue-cj/2406200657031625700.webp",
    "color": "#f4f2ed",
    "description": "Trousse en forme de poisson. Matière déclarée par le fournisseur : canvas.",
    "details": [
      "Âge d’utilisation non communiqué : à confirmer avant toute vente.",
      "Matières indiquées par le fournisseur : Matière déclarée par le fournisseur : canvas.",
      "Référence fournisseur CJ : 2406200657031625700"
    ],
    "demo": false,
    "supplierProductId": "2406200657031625700",
    "supplierVariantId": "2406200657031625900"
  }
];

const prices = new Map<string, any>(pricing.products.map((p:any)=>[p.pid||p.supplierProductId,p]));
const ages=readAgeEvidence(ageEvidence);
export const products:Product[] = baseProducts.map(p=>{const v=prices.get(p.supplierProductId);const a=ages.get(p.supplierProductId.toUpperCase());if(!a||a.id!==p.id||a.vid!==p.supplierVariantId)throw Error("AGE_PRODUCT_MISMATCH");return {...p,ageKnown:a.ageKnown,ageGroups:a.ageGroups,ageGroupCoverage:a.ageGroupCoverage,ageLabel:a.ageLabel,ageSource:a.ageSource,ageEvidenceStatus:a.qualificationStatus,details:[a.ageLabel+". Cette information reste à vérifier avant la vente.",...p.details.filter(d=>!d.startsWith("Âge d’utilisation"))],indicativePriceCents:v?.indicativePriceCents??null,priceStatus:v?.priceStatus||"cout_incomplet",priceLabel:v?.priceLabel||"Tarif à confirmer",catalogueCategory:v?.category||p.category,catalogueCategoryLabel:v?.categoryLabel||p.subtitle,...(v?.variants?{variants:v.variants.map((x:any)=>({id:x.variantId||x.id,label:x.variantKey&&x.variantKey.length<=70?"Variante : "+x.variantKey:"Variante fournisseur contrôlée",availableForCheckout:false}))}:{} )};});
