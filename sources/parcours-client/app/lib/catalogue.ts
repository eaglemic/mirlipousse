/** Catalogue public : identifiants boutique opaques, aucune référence commerciale interne. */
import pricing from "./pricing-public.json";
import variantCatalogue from "./variants-public.json";
import ageEvidence from "./age-evidence-public.json";
import {readAgeEvidence,type AgeCoverage} from "../age-groups";
import {isCatalogueExcluded} from "../catalogue-exclusions";
export type ProductVariant={id:string;label:string;image?:string;imageAlt?:string;priceCents:number;priceStatus:"fixed";priceIncludesShipping:false;indicativePriceCents?:number|null;availableForCheckout:boolean};
export type Product = {ageKnown?:boolean;ageGroups?:string[];ageGroupCoverage?:AgeCoverage[];ageSource?:string;ageEvidenceStatus?:string;indicativePriceCents?:number|null;priceStatus?:string;priceLabel?:string;catalogueCategory?:string;catalogueCategoryLabel?:string;variants?:ProductVariant[];id:string; name:string; subtitle:string; category:'eveil'|'creativite'|'aventure'|'quotidien'; age:'0-2'|'3-5'|'6-8'|'9-12'|null; ageLabel:string; priceCents:number; priceIncludesShipping?:false; image:string; color:string; description:string; details:string[]; demo:false; defaultVariantId:string;};
const baseProducts: (Omit<Product,"priceCents">&{priceCents:null})[] = [
  {
    "id": "mm-p-823e50754eaf2e54744e3eb4ba764152e87c19283266142e89d337ec6a1b2b84",
    "name": "Kit de fouille de pierres et gemmes",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/a858534955ac5bcc8f65aec3029fc0ed196f3fac9a0cff8a732c5a72032728d6.webp",
    "color": "#f4f2ed",
    "description": "Un coffret de fouille avec un bloc à creuser et des accessoires pour découvrir les pierres proposées par la fiche article.",
    "details": [
      "Matières annoncées : Pierres et accessoires en plastique mentionnés dans la description."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-3c1c133af999c662b568fc33c3ff366f664f2c611fcacd691a8087b742e2d78c"
  },
  {
    "id": "mm-p-3304df193601a8fdb6590949202f9c1c572bb0342fe174696c3ca8a2167bda17",
    "name": "Sac bandoulière fraise pour enfant",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/7aad7d36c53d33ee4e318510d965f9480a4099461fda2db1230db868a33ada1a.webp",
    "color": "#f4f2ed",
    "description": "Un petit sac en forme de fraise, avec une bandoulière et une fermeture. La photo correspond à la variante rouge contrôlée.",
    "details": [
      "Matières annoncées : EVA et polyester mentionnés par la fiche article."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-0675da0d17aeb40b786a863693f561cf13f00e9125f855f0234adb9906a8ec88"
  },
  {
    "id": "mm-p-0e2212657d8635a8dabf95c69735291c6da92e85ac353c40e2baa2229c6057dc",
    "name": "Sac tressé pour enfant",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/25e6a2fbe6a240d2bce029e00bfe9dfbc37d0a0583871ba7c6bf2e38c470fa4d.webp",
    "color": "#f4f2ed",
    "description": "Un sac tressé avec une bandoulière, présenté par la fiche article comme un accessoire pour enfant.",
    "details": [
      "Matières annoncées : Paille, selon la description de l’article."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-c858403c51f1590dbd9ede81fe4ef8e249c0559afd9c16c2c424af8a7123b833"
  },
  {
    "id": "mm-p-b6849588037d268d287c9bdda053281b8cb33f647cc06dd24ca98c715fe431c9",
    "name": "Sac à dos léger à motif pour enfant",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/a337cf6b7f73dd6e2e9183b889006a6260afe639c57c778da767e971a5434b8d.webp",
    "color": "#f4f2ed",
    "description": "Un sac à dos à motif pour enfant. La fiche article indique un tissu nylon et une doublure polyester.",
    "details": [
      "Matières annoncées : Nylon et doublure polyester, selon la description de l’article."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-149b2b6b899532c9cd17d2038fe58f7ab2394628fae95b9fe8ce54927521d3ec"
  },
  {
    "id": "mm-p-aabc0acf34b25b5c039b465d32e7b2a11cda79bd08951c49bf1e5ad34f3d9eba",
    "name": "Sac à dos dinosaure",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/46e692be825a6d26fb9a64adb86f3107af166245eb3e7ebd6db4a2d35951f0cc.webp",
    "color": "#f4f2ed",
    "description": "Un sac à dos à motif dinosaure. La fiche article indique un tissu Oxford et une doublure polyester.",
    "details": [
      "Matières annoncées : Tissu Oxford et doublure polyester, selon la description de l’article."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-9ae322840a5418696fdb1771f30ea4bff2f05cb8cb5e42db16005edc00d1e57f"
  },
  {
    "id": "mm-p-faf13d79dd653e119dff8ef046492a36deebb69f7eb3417b2bfc84bddee00e80",
    "name": "Sac à dos panda en peluche",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/68a34a2e1f799836fa5d7774d7efdfa98bb04ea9ee8b2e6077d71d47e4ebd3ae.webp",
    "color": "#f4f2ed",
    "description": "Un sac à dos en forme de panda, présenté en peluche courte avec un rembourrage décrit par la fiche article.",
    "details": [
      "Matières annoncées : Peluche courte ; remplissage indiqué « PP cotton » par la fiche article."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-8cee9b945c3041ec01d9de78a91c4d989a11da081e4c1bf04faf398adf63f097"
  },
  {
    "id": "mm-p-fc63e665654e6369c22956728944b831fe20fa5fa4d4e5238ac1cf5cb4aa4b87",
    "name": "Petit sac à dos à motif pour enfant",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/2635a5d7ac69a34c44fac50d0822fe3eebfee03f0ab83569690c00f1d28108b2.webp",
    "color": "#f4f2ed",
    "description": "Un petit sac à dos à fermeture zippée, proposé avec plusieurs motifs animaux. La photo correspond à la variante contrôlée.",
    "details": [
      "Matières annoncées : Matière décrite comme « diving material » par la fiche article ; composition non précisée."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-b16226bee645d7bd177d713f2b78cba9a85dc55de4d7b021e8a9cebb5c833c46"
  },
  {
    "id": "mm-p-3a2083c3a6856ddc2b8801a954374a70948305d8029d14519e759db405de9b21",
    "name": "Pull enfant à motif brodé",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/e877096285ab686d07e0cea0c22ebe3d6f73677ff565bccc427ca7495488321a.webp",
    "color": "#f4f2ed",
    "description": "Un pull enfant à manches longues et motif brodé.",
    "details": [
      "Matières annoncées : Fibre d’alcool polyvinylique (Vinylon) indiquée par la fiche article."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-e14cc52b4bac899f4a39ab2ed55601f8f57bbb0f8ca81276afa65e04b6d5df3e"
  },
  {
    "id": "mm-p-41f5e7627e3575f06b31b2db676cd8a12cac15ddd56999167f75b7ea4f304624",
    "name": "Sous-vêtements thermiques pour enfant",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/ee5bbeed0c9ae1f0a1b711dbf3d81379b6e7d8535885dcd8a299ea6046680d30.webp",
    "color": "#f4f2ed",
    "description": "Un ensemble textile enfant à manches longues et motif rayé.",
    "details": [
      "Matières annoncées : Polyester indiqué par la fiche article."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-0325b626cf9ab40188bcbd5b399e6f04086f969be8b7ae2c3e787f2e6b83724a"
  },
  {
    "id": "mm-p-c94d83d5543500ec60ad90fd03419e6f56987e0b3e02ca956d2279da035d2fc8",
    "name": "Sac à dos à oreilles de lapin",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/21bf7ef30914b9d95861f459ef3cf09050e4921a48de14bebd103603eb4d0c81.webp",
    "color": "#f4f2ed",
    "description": "Un sac à dos avec des oreilles de lapin et un nœud décoratif. La photo correspond à la variante bleue contrôlée.",
    "details": [
      "Matières annoncées : Composition non renseignée dans les données reçues."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-740751c98c26da32799844d3bfec1b832a34781067b8bb64b0a0e778dd8a7c59"
  },
  {
    "id": "mm-p-5a35d5de2bf93d32b4ae6d3c0628ef1846d34afb220e7600bdaecd89c53da652",
    "name": "Petit sac à dos fraise pour enfant",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/c0c167ff6071a7ef9cd95915f62b2d809792943a71d1d33c887c97785904ebad.webp",
    "color": "#f4f2ed",
    "description": "Un petit sac à dos enfant à motif fraise sur la photo de la variante rose contrôlée. La fiche article indique une doublure polyester.",
    "details": [
      "Matières annoncées : Doublure polyester indiquée par la fiche article ; matière extérieure non précisée."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-e1e1c1dd4d9dfa4d2f03805077bac69cca4de8144e75214a4635a7d347c65b35"
  },
  {
    "id": "mm-p-cb664a3c1b8a99d09e3e9363a54e69ad72c8e528e3cba9dc3221d375939b5284",
    "name": "Puzzle en bois animaux de la ferme",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/e70964abb4d2503824fc7486e134abb966472c899d697e9aa5d9387499cdd972.webp",
    "color": "#f4f2ed",
    "description": "Puzzle en bois animaux de la ferme. Matière déclarée par la fiche article : splint Warning slogan.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : splint Warning slogan."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-6106673eb034c4fe22e5a876b4aa0ea00e904ff0b7edeac844f333dc8e649d58"
  },
  {
    "id": "mm-p-9c2b061e744230456518dc7610ebc8031a2b41947efc37f7d1f0a956131a8acd",
    "name": "Puzzle chiffres et animaux",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/f01e154c9472fcdef0fcc054b3b59fd8ff015429aa87e583d5511f70c6ba12cf.webp",
    "color": "#f4f2ed",
    "description": "Puzzle chiffres et animaux. Matière déclarée par la fiche article : Wooden Specification.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : Wooden Specification."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-2e1be01a1cc32e85ad79a698a76ba5cb62fda58f7a5a079b2bd403da56866272"
  },
  {
    "id": "mm-p-bad7ce63d87ba6a6a3669d3e7f7d63e9c5588b0930ffc0affe9e8fd1d7b2167c",
    "name": "Jeu de réflexion parent-enfant",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/660ac65076404da4732d638ec658d6f69698e1dd6d46b69d099d44d66dfb0002.webp",
    "color": "#f4f2ed",
    "description": "Jeu de réflexion parent-enfant. Matière déclarée par la fiche article : EVA.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : EVA."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-1e9509ffccc903a382425c7939fa8f9593ca8a1cbc3a24522c987c0216c5791a"
  },
  {
    "id": "mm-p-815ce8de9c4b71f2e0256fa1f5652074166304c369b58ac924b2502ec45a6411",
    "name": "Jeu d’encastrement de cylindres en bois",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/e29c89d3d5061df5e38702ac5c9a3fa3279e998fbfdcb418ea56dd1b5ae97dde.webp",
    "color": "#f4f2ed",
    "description": "Un jeu d’encastrement de cylindres en bois de tailles différentes. Aucun label pédagogique ou certification Montessori n’est revendiqué.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : wood."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-9261bbd476ed376f40e153a638ceaaf8440ebc1bb5f39e768b2533a04df2ae5c"
  },
  {
    "id": "mm-p-b2383fefd2e9ba541a86cc2d51f3704441d0ffa500a9ebd64ccd2cf5a5aa7990",
    "name": "Bandes de papier pour étoiles en origami",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/6d0c6fde42140500d150710bde8364455cb486fc549fae1a5b384a1cb018f47f.webp",
    "color": "#f4f2ed",
    "description": "Bandes de papier pour étoiles en origami.",
    "details": [],
    "demo": false,
    "defaultVariantId": "mm-v-cc4a829fd563e01c4e2bbae625d0c62b09d239b944dde0201bacc30864d30994"
  },
  {
    "id": "mm-p-2f38175ac582b0b7de4cc98b402e5b8afacb2a8843c097698943fe84b32c3ac7",
    "name": "Ciseaux de loisirs créatifs en plastique",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/6477f9323cc94f0b009ffcaa17719c5ecec87f422810ff90294c33213ddf0bc5.webp",
    "color": "#f4f2ed",
    "description": "Ciseaux de loisirs créatifs en plastique. Matière déclarée par la fiche article : ABS.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : ABS."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-5f9e7eea07469b48f6890d462b907d0c6df02ed671acdd753b70db46e38ab21c"
  },
  {
    "id": "mm-p-0d6bbc93ab1278d3eba2af5a6874f4887a6b734ef2dd7048fe7a65211db1391e",
    "name": "Seau de plage en silicone",
    "subtitle": "Inventer des aventures",
    "category": "aventure",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/8853a6fe8349e8b5a5c33ab662668d9b0f79eff767cce6e2fdf5b4e97e1cb6a0.webp",
    "color": "#f4f2ed",
    "description": "Seau de plage en silicone. Matière déclarée par la fiche article : Silicone Quantity.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : Silicone Quantity."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-02e51846da84c6fe88a72a0ab32be9cd804630fcc6c92b38ab616c2582eee0a4"
  },
  {
    "id": "mm-p-c21b8fd2c991af41a57c4d25fc85e980531b5d29726c3ff33034e9f4004366f7",
    "name": "Blocs de construction en arc-en-ciel",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/f51ecc0d638be63a197e314505335cad1672a13941ef807eddecf87088c44ec1.webp",
    "color": "#f4f2ed",
    "description": "Blocs de construction en arc-en-ciel. Matière déclarée par la fiche article : wooden Paint material.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : wooden Paint material."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-c63204ba5822e694461424c87a185b7cd859d05868a7421fcf52c60f30f8d0f7"
  },
  {
    "id": "mm-p-372c0e81aeec591e14c83d00006f31a06a77e5123a3024fc700e3cd31385f073",
    "name": "Fusée à empiler en silicone",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/ec5b1c788d8b0efdb8b21a2b355b7530545fc066a23ccddf5b1b190e497e3718.webp",
    "color": "#f4f2ed",
    "description": "Fusée à empiler en silicone. Matière déclarée par la fiche article : Edible Silicon Category.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : Edible Silicon Category."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-5b437d19a031a2a323e0a1b4c09f8439fdc3c78066bead54c7835e5add717a8d"
  },
  {
    "id": "mm-p-090d59841e56c16c833352b9d16f87f21644e4b2b09f2b4508b5307621cfe7d4",
    "name": "Jeu d’équilibre animaux",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/7d06e82bfbfe0e1db7dfef7c76ada445010d15cb675cd5ca2bf7a1b2e438754c.webp",
    "color": "#f4f2ed",
    "description": "Des pièces en forme d’animaux à placer en équilibre. Aucun rattachement à une marque de jeu n’est revendiqué.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : Wooden."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-8aef1e2e68cd752ba5a5a70a2db27ced920d6a002589551e7b14f732e3393f33"
  },
  {
    "id": "mm-p-66c510a11b209638abf985bcc519dfc9d66b383871d72b541eaf48c5f3004345",
    "name": "Trousse de rangement portable",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/93654c798f14c2777d7d440493dffea41643aaba372269a4c155f731900faf6a.webp",
    "color": "#f4f2ed",
    "description": "Trousse de rangement portable. Matière déclarée par la fiche article : Little Oxford Capacity.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : Little Oxford Capacity."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-c5c6940b2d369141e6933cc4a74ee6a5cba2f5b7587dffabc8c3c7505bced8d9"
  },
  {
    "id": "mm-p-0946c65623867fcdec4b37ba6980148f160f2628f69d604a9d2421d2e5d4d630",
    "name": "Trousse de rangement à compartiments",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/01a4ea3c3933e6468644d86528ffb38ff97c3bfdcb8a32605d1671f0d50f6e31.webp",
    "color": "#f4f2ed",
    "description": "Trousse de rangement à compartiments. Matière déclarée par la fiche article : pu.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : pu."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-14382cf98050eee307f0828b93f408cd5e3b1519755419e9ed7f3db01dacf9e8"
  },
  {
    "id": "mm-p-590a9263bb170573e6b3a48b08eb80e02fad9d999085e5fd5d4e60bf8f2e3dae",
    "name": "Trousse transparente à motif",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/c5c139126af533d425aa9bff77db70b4b9eaad3bcfbd6f517fe07476e3b2e5df.webp",
    "color": "#f4f2ed",
    "description": "Trousse de rangement à fermeture. La peluche panda visible sur certaines photos est un accessoire de présentation non inclus.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : Polyester."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-5441ea041314ce4aeb07026281e63b49f3ff6dc08c671d4d736ee43917f23c10"
  },
  {
    "id": "mm-p-88c1178fb21dabd82de1073b3513347226eb6a31f91c8e7bb3aa5e6ffa41810a",
    "name": "Petit tableau de dessin effaçable",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/29ff422042836076a68cbf96d59a7939b1d29bba4d4e947137e29be7d2687026.webp",
    "color": "#f4f2ed",
    "description": "Petit tableau de dessin effaçable.",
    "details": [],
    "demo": false,
    "defaultVariantId": "mm-v-fbf382d0a4b0bdb416cbb8c8556ba5b8016161409397c735617d003a9ab3a771"
  },
  {
    "id": "mm-p-d1d04026b47a3ea576be5755882112f48202c219680036cf97b78c3abd9baa41",
    "name": "Livre de dessin à plusieurs faces",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/cbd737bcb8fc508a7203be4b5737f27644255487461f69bf8ed557307bf3cea3.webp",
    "color": "#f4f2ed",
    "description": "Livre de dessin à plusieurs faces. Matière déclarée par la fiche article : PVC Name.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : PVC Name."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-217f30f037f8e62d9a94cab2c0edc1b2461e2d39b5ec59f4d2e0d27189072956"
  },
  {
    "id": "mm-p-6e3ed3af67270101e1306ffe56084d6c8d70072f26972bb33aac5ead782acc2f",
    "name": "Trousse dépliable à compartiments",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/d0de35e47bd1e8a02666fd848db87b0dba57f0b6a8eb7fba2e7a92524fcb1aad.webp",
    "color": "#f4f2ed",
    "description": "Trousse dépliable à compartiments.",
    "details": [],
    "demo": false,
    "defaultVariantId": "mm-v-b339ac1caacb3f36edf88fcd8f6b8596318dc61d48a2f738ae2bf56c278940c0"
  },
  {
    "id": "mm-p-8ddea62e164911139031e71eb1d4647181e176bc7968440b0cbc59d4c59b3367",
    "name": "Trousse transparente avec poignée",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/248364638eba4626c3c905e3b859f25889631295f65a0d5b068875e211549968.webp",
    "color": "#f4f2ed",
    "description": "Trousse transparente avec poignée. Matière déclarée par la fiche article : Polyester.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : Polyester."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-7294c29edcccf42d03ee667e40d29a945761db0e3698bc0b868427f83879b22b"
  },
  {
    "id": "mm-p-ea4c1ecbd9b5033435289ccf4fa486cdcdc67df328a902eca44c372abdeb0b25",
    "name": "Trousse en tissu à nœud",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/51689b5b014689b23b3d8926e73f4f995deb649feedf99bf6ad4e623de7971d8.webp",
    "color": "#f4f2ed",
    "description": "Trousse en tissu à nœud. Matière déclarée par la fiche article : polyester cotton.",
    "details": [
      "Matières annoncées : Matière déclarée par la fiche article : polyester cotton."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-194c6c21617875c0f7a21ee06b0c9014dd93e64b4e0a472224fe454750250bb8"
  },
  {
    "id": "mm-p-13913e34a4a36153d8285a15a5c6113ad2f8453fffb4ead91245c644f3cbaac3",
    "name": "Trousse pastel à damier — lapin",
    "subtitle": "Les petites habitudes",
    "category": "quotidien",
    "age": null,
    "ageLabel": "Âge non renseigné",
    "priceCents": null,
    "image": "/media/articles/7514604b31f4d99783ad81b1f23a2950a6d4a300da4a2fccb660f52bb85feef4.webp",
    "color": "#f8e6ec",
    "description": "Une trousse rose à damier, avec un motif lapin et plusieurs poches zippées. La photo correspond au modèle présenté.",
    "details": [
      "Matière et dimensions indiquées sur la photo : tissu Oxford, 22 × 7,5 × 10 cm."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-4316be8785e822cf0d1835c0f05e11d1cec98fb50de143a3eeaba072b83cf299"
  },
  {
    "id": "mm-p-fb6a8bbf82368b3a6832ebe570fc800614b18daf721d04d8670dee675fbfb453",
    "name": "Satellite solaire en bois à assembler",
    "subtitle": "Créer & imaginer",
    "category": "creativite",
    "age": null,
    "ageLabel": "",
    "priceCents": null,
    "image": "/media/variantes/image-983071268dc9dd4c72c39b46.jpg",
    "color": "#f4f2ed",
    "description": "Un modèle de satellite à assembler, avec des pièces en bois et des éléments électriques selon la fiche article. Le kit est proposé non assemblé.",
    "details": [
      "Matières annoncées : bois et métal.",
      "Modèle à assembler soi-même ; éléments électriques et contenu exact à confirmer avant la vente."
    ],
    "demo": false,
    "defaultVariantId": "mm-v-3de2108e27bad22718efccbbb63be058dbb1f473266560f28c86015c42002136"
  }
];

const variantProducts=new Map(variantCatalogue.products.map(p=>[p.id,p]));
const prices = new Map<string, any>(pricing.products.map((p:any)=>[p.id,p]));
const ages = readAgeEvidence(ageEvidence);
export const products:Product[] = baseProducts.filter(p=>!isCatalogueExcluded(p)).map(p=>{const v=prices.get(p.id);if(!v||!Number.isSafeInteger(v.priceCents)||v.priceCents<1||v.priceStatus!=="fixed")throw Error("PRICE_PRODUCT_MISMATCH");const a=ages.get(p.id);if(!a||a.variantId!==p.defaultVariantId)throw Error("AGE_PRODUCT_MISMATCH");return {...p,ageKnown:a.ageKnown,ageGroups:a.ageGroups,ageGroupCoverage:a.ageGroupCoverage,ageLabel:a.ageLabel==="Âge non renseigné"?"":a.ageLabel.split(" · ")[0],ageSource:a.ageSource,ageEvidenceStatus:a.qualificationStatus,details:p.details,priceCents:v.priceCents,priceIncludesShipping:false,indicativePriceCents:v.priceCents,priceStatus:"fixed",priceLabel:v.priceLabel,catalogueCategory:v?.category||p.category,catalogueCategoryLabel:v?.categoryLabel||p.subtitle,variants:(variantProducts.get(p.id)?.variants||v?.variants||[]).map((x:any)=>{if(!Number.isSafeInteger(x.priceCents)||x.priceCents<1||x.priceStatus!=="fixed")throw Error("PRICE_VARIANT_MISMATCH");return {...x,indicativePriceCents:x.priceCents,availableForCheckout:false}})};});
