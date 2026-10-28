"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Check, ChevronDown, Gift, Heart, Leaf, Menu, Minus, Plus, Search, ShoppingBag, SlidersHorizontal, Sparkles, Sprout, Star, X } from "lucide-react";
import { products, type Product } from "./lib/catalogue";
import MotionDesign, { flyToBag } from "./motion-design";
import { GuideTeasers } from "./components/editorial-shell";
import { collections } from "./lib/editorial";
import ReviewsSummary from "./reviews-summary";
import {AGE_GROUPS,matchesAge,countAges,ageCoverageLabel} from "./age-groups";
import CommercePanel,{useCommerceCatalogue} from "./commerce-panel";
import {euros,type Variant} from "./commerce-client";
import {restoreCart,restoreFavorites,aliases,type CartLine,type UnresolvedLine} from "./cart-state";
import {isCatalogueExcluded} from "./catalogue-exclusions";

const priceLabel=(p:Product)=>typeof p.indicativePriceCents==='number'?euros(p.indicativePriceCents)+' · indicatif':"Tarif à confirmer";
const categories = [
 {id:'tout',name:'Tout découvrir'},
 {id:'puzzles-reflexion',name:'Puzzles & réflexion'},
 {id:'eveil-construction',name:'Éveil & construction'},
 {id:'loisirs-creatifs',name:'Loisirs créatifs'},
 {id:'sacs-enfants',name:'Sacs enfants'},
 {id:'trousses-rangement',name:'Trousses & rangement'},
 {id:'vetements-enfants',name:'Vêtements enfants'},
 {id:'jeux-plein-air',name:'Plein air'},
];
const ages = [
  { id: "0-2", title: "Les premiers trésors", label: "0–2 ans", icon: Sprout, color: "#eee8d9" },
  { id: "3-5", title: "L’imagination s’éveille", label: "3–5 ans", icon: Sparkles, color: "#f6dfd1" },
  { id: "6-8", title: "Le monde à explorer", label: "6–8 ans", icon: Leaf, color: "#e1e7d9" },
  { id: "9-12", title: "Les idées en grand", label: "9–12 ans", icon: Star, color: "#e5e4ef" },
];
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function Storefront() {
  const [category, setCategory] = useState("tout");
  const [age, setAge] = useState("tout");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("selection");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [unresolved,setUnresolved]=useState<UnresolvedLine[]>([]);
  const [storageError,setStorageError]=useState(false);
  const [selectedVariant,setSelectedVariant]=useState("");
  const remote=useCommerceCatalogue();
  const [selected, setSelected] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [country, setCountry] = useState("FR");
  const detailDialog = useRef<HTMLDialogElement>(null);
  const cartDialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("mirlipousse.panier.v1") || "[]");
      const liked = JSON.parse(localStorage.getItem("mirlipousse.favoris.v1") || "[]");
      const restored=restoreCart(saved,products);setCart(restored.lines);setUnresolved(restored.unresolved);
      setFavorites(restoreFavorites(liked,products));
    } catch {setStorageError(true);}
    const params=new URLSearchParams(location.search);const requested=params.get('produit');
    if(isCatalogueExcluded(requested)){const url=new URL(location.href);url.searchParams.delete('produit');history.replaceState(null,'',url.pathname+url.search+url.hash);}
    const linkedProduct=requested?aliases(products).get(requested):null;if(linkedProduct){setSelected(linkedProduct);setSelectedVariant(linkedProduct.supplierVariantId);}
    const linkedCategory=params.get('categorie');if(categories.some(c=>c.id===linkedCategory))setCategory(linkedCategory!);
    const linkedAge=params.get('age');if(linkedAge==='age-inconnu'||AGE_GROUPS.some(g=>g.id===linkedAge))setAge(linkedAge!);
    setStorageReady(true);
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  useEffect(() => {
    if (!storageReady||storageError) return;
    try {
      if(!storageError)localStorage.setItem("mirlipousse.panier.v1", JSON.stringify([...cart,...unresolved]));
      localStorage.setItem("mirlipousse.favoris.v1", JSON.stringify(favorites));
    } catch { /* Le panier reste utilisable en mémoire. */ }
  }, [cart, favorites, storageReady,unresolved,storageError]);

  useEffect(()=>{if(!storageReady)return;const url=new URL(location.href);if(age==='tout')url.searchParams.delete('age');else url.searchParams.set('age',age);if(category==='tout')url.searchParams.delete('categorie');else url.searchParams.set('categorie',category);history.replaceState(null,'',url.pathname+url.search+url.hash);},[age,category,storageReady]);

  useEffect(() => {
    const dialog = detailDialog.current;
    if (selected && dialog && !dialog.open) dialog.showModal();
    else if (!selected && dialog?.open) dialog.close();
  }, [selected]);
  useEffect(() => {
    const dialog = cartDialog.current;
    if (cartOpen && dialog && !dialog.open) dialog.showModal();
    else if (!cartOpen && dialog?.open) dialog.close();
  }, [cartOpen]);
  useEffect(() => {
    const prior = document.body.style.overflow;
    if (selected || cartOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prior; };
  }, [selected, cartOpen]);
  useEffect(() => { if (searchOpen) searchInput.current?.focus(); }, [searchOpen]);

  const contextual=useMemo(()=>products.filter(p=>(category==='tout'||(p.catalogueCategory||p.category)===category)&&(!favoritesOnly||favorites.includes(p.id))&&normalize(`${p.name} ${p.subtitle} ${p.description}`).includes(normalize(search.trim()))),[category,favoritesOnly,favorites,search]);
  const ageCounts=countAges(contextual),allAgeCounts=countAges(products);
  const filtered = useMemo(() => {
    const result=contextual.filter(p=>matchesAge(p,age));
    if(sort==='nom')result.sort((a,b)=>a.name.localeCompare(b.name,'fr'));
    if(sort==='prix-croissant'||sort==='prix-decroissant')result.sort((a,b)=>typeof a.indicativePriceCents!=='number'?typeof b.indicativePriceCents!=='number'?0:1:typeof b.indicativePriceCents!=='number'?-1:(a.indicativePriceCents-b.indicativePriceCents)*(sort==='prix-croissant'?1:-1));
    return result;
  },[contextual,age,sort]);
  const cartLines = cart.map(line => ({ ...line, product: products.find(p => p.id === line.id)! })).filter(line => line.product);
  const quantity = cart.reduce((sum, line) => sum + line.quantity, 0)+unresolved.reduce((sum,line)=>sum+line.quantity,0);
  function variantsFor(p:Product):Variant[]{const curated=p.variants||[{id:p.supplierVariantId,label:'Variante fournisseur contrôlée',availableForCheckout:false}];const distant=remote.catalogue?.products.find(r=>r.supplierProductId===p.supplierProductId)?.variants;return curated.map(v=>({...v,availableForCheckout:distant?.find(r=>r.id===v.id)?.availableForCheckout===true}));}
  function openProduct(p:Product){setSelected(p);setSelectedVariant(p.supplierVariantId);}
  const subtotal=cartLines.reduce((sum,l)=>sum+(l.product.indicativePriceCents||0)*l.quantity,0);
  const anyPriced=cartLines.some(l=>typeof l.product.indicativePriceCents==='number');
  const incomplete=cartLines.some(l=>typeof l.product.indicativePriceCents!=="number")||unresolved.length>0;
  const unknownVariant=cartLines.some(l=>!variantsFor(l.product).some(v=>v.id===l.variantId));


  function closeProduct() {
    setSelected(null);
    const url = new URL(location.href);
    if (url.searchParams.has("produit")) {
      url.searchParams.delete("produit");
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  }

  function notify(text: string) {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => { setToast(""); setLastAdded(null); }, 2600);
  }
  function like(id: string) { setFavorites(prior => prior.includes(id) ? prior.filter(x => x !== id) : [...prior, id]); }
  function add(product: Product, button?: HTMLElement, variantId=product.supplierVariantId) {
    if(!variantsFor(product).some(v=>v.id===variantId)){notify("Choisissez une variante documentée.");return;}
    const line = cart.find(x => x.id === product.id&&x.variantId===variantId);
    if(!line&&cart.length+unresolved.length>=20){notify("Le panier contient déjà20 références. Retirez une ligne avant d’en ajouter une autre.");return;}
    if (line && line.quantity >= 10) { notify("10 exemplaires maximum dans le panier d’essai."); return; }
    setCart(prior => prior.some(x => x.id === product.id&&x.variantId===variantId) ? prior.map(x => x.id === product.id&&x.variantId===variantId ? { ...x, quantity: x.quantity + 1 } : x) : [...prior, { id: product.id, variantId, quantity: 1 }]);
    setLastAdded(product.id);
    if (button) flyToBag(product.image, product.color, button);
    notify(`${product.name} ajouté au panier d’essai`);
  }
  function changeQuantity(id: string,variantId:string, delta: number) {
    setCart(prior => prior.map(line => line.id === id&&line.variantId===variantId ? { ...line, quantity: Math.min(10, line.quantity + delta) } : line).filter(line => line.quantity > 0));
  }
  function browse(nextCategory = "tout", nextAge = "tout") {
    setCategory(nextCategory); setAge(nextAge); setFavoritesOnly(false); setMobileMenu(false);
    document.getElementById("collection")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  function reset() { setCategory("tout"); setAge("tout"); setSearch(""); setFavoritesOnly(false); setSort("selection"); }

  return <>
    <MotionDesign />
    <a className="skip-link" href="#contenu">Aller au contenu</a>
    <div className="announcement"><span>Des petits riens qui font grandir les grands rêves.</span><span>France & Belgique <span aria-hidden="true">↗</span></span></div>
    <header className="site-header">
      <a className="brand" href="/" aria-label="Mirlipousse, accueil"><span className="brand-icon"><Sprout size={29} strokeWidth={1.5} /></span><span>mirlipousse<span className="brand-dot">.</span><small>LES PETITES GRANDES DÉCOUVERTES</small></span></a>
      <nav className="desktop-nav" aria-label="Navigation principale">
        <button onClick={() => browse()}>Tous les trésors</button><button onClick={() => browse("loisirs-creatifs")}>Créer & imaginer</button><button onClick={() => browse("trousses-rangement")}>Accessoires</button><a href="/guides">Le carnet d’idées</a><a href="#notre-univers">Notre univers</a>
      </nav>
      <div className="header-actions">
        <button className="icon-button" aria-label="Rechercher un produit" onClick={() => {setSearchOpen(true);searchInput.current?.focus();document.getElementById("collection")?.scrollIntoView();}}><Search size={21} /></button>
        <button className={`icon-button favorite-button ${favoritesOnly ? "active" : ""}`} aria-label={`Mes favoris, ${favorites.length} produit${favorites.length > 1 ? "s" : ""}`} aria-pressed={favoritesOnly} onClick={() => { setFavoritesOnly(v => !v); setCategory("tout"); setAge("tout"); document.getElementById("collection")?.scrollIntoView(); }}><Heart size={21} fill={favoritesOnly ? "currentColor" : "none"} /></button>
        <button className="cart-toggle" aria-label={`Ouvrir le panier, ${quantity} article${quantity > 1 ? "s" : ""}`} onClick={() => { setSelected(null); setCartOpen(true); }}><ShoppingBag size={20} /><span className="cart-label">Mon panier</span><span className="cart-count" key={quantity}>{quantity}</span></button>
        <button className="icon-button mobile-toggle" aria-label={mobileMenu ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={mobileMenu} onClick={() => setMobileMenu(v => !v)}>{mobileMenu ? <X /> : <Menu />}</button>
      </div>
    </header>
    {mobileMenu && <nav className="mobile-nav" aria-label="Navigation mobile"><button onClick={() => browse()}>Tous les trésors</button><button onClick={() => browse("loisirs-creatifs")}>Créer & imaginer</button><button onClick={() => browse("trousses-rangement")}>Accessoires</button><a href="#notre-univers" onClick={() => setMobileMenu(false)}>Notre univers</a></nav>}

    <main id="contenu">
      <section className="hero">
        <div className="hero-copy"><p className="eyebrow"><span />JOUETS & ACCESSOIRES · 0 À 12 ANS</p><h1>Les petits jeux.<br />Les <em>grandes</em><br />découvertes.</h1><p className="hero-description">Jouets d’éveil, idées créatives et jolis accessoires : un petit monde pour laisser grandir leur imagination.</p><button className="button button-dark" onClick={() => browse()}>Explorer la collection <ArrowRight size={18} /></button><a className="text-link hero-age-link" href="#par-age">À chaque âge, ses merveilles <ArrowDown size={15} /></a><p className="hero-footnote"><Sprout size={17} /> De la curiosité, des couleurs et beaucoup d’imagination.</p></div>
        <div className="hero-visual"><div className="hero-photo"><img src="/media/univers-mirlipousse.webp" alt="Composition illustrée de jouets colorés, cubes, arc-en-ciel et petits accessoires Mirlipousse" width={1536} height={1024} fetchPriority="high" /><span className="hero-stamp"><Sparkles size={18} /><span>Le début de<br /><strong>mille aventures</strong></span></span></div><span className="dream-star star-one" aria-hidden="true">✦</span><span className="dream-star star-two" aria-hidden="true">✧</span><span className="hero-scribble" aria-hidden="true">jouer.<br /><em>rêver.</em> grandir.</span><span className="hero-caption">UN PETIT MONDE DE POSSIBLES</span></div>
      </section>

      <div className="preparation-note"><span className="preparation-dot" />Découvrez nos premières références et leurs photos fournisseur. Les tarifs affichés sont indicatifs, hors livraison. Les commandes restent fermées pendant la qualification du parcours.<a href="/ouverture">Suivre la préparation <ArrowRight size={14} /></a></div>

      <section className="age-section section-wrap" id="par-age"><div className="section-intro compact"><div><p className="eyebrow">GRANDIR À SON RYTHME</p><h2>À chaque âge,<br className="mobile-break" /> son petit monde.</h2></div><p>Des premières découvertes<br />aux grandes idées. Âges précis sur les fiches.</p></div><div className="age-grid">{ages.map(({ id, title, label, icon: Icon, color }) => <button key={id} className={`age-card ${age === id ? "selected" : ""}`} style={{ background: color }} onClick={() => browse("tout", id)}><span className="age-doodle"><Icon size={34} strokeWidth={1.25} /></span><span><strong>{label}</strong><small>{title}<span className="age-hero-count">{allAgeCounts[id]} référence{allAgeCounts[id]>1?'s':''}</span></small></span><ArrowRight size={18} /></button>)}</div></section>

      <section className="collection section-wrap" id="collection"><div className="section-intro"><div><p className="eyebrow">LA COLLECTION DÉCOUVERTE</p><h2>Leur prochain<br /><em>petit bonheur.</em></h2></div><p>Pour jouer, créer et faire comme les grands.<br />Et surtout, pour être simplement soi.</p></div>
        <section className="catalogue-agebar" aria-labelledby="catalogue-age-title"><div className="catalogue-age-heading"><h3 id="catalogue-age-title">Je cherche pour quel âge ?</h3><p>Les comptes suivent votre type de produit et votre recherche.</p></div><div className="age-filter-options" role="group" aria-label="Filtrer les produits par âge">{[{id:'tout',label:'Tous les âges'},...AGE_GROUPS,{id:'age-inconnu',label:'Âge non indiqué'}].map(g=><button type="button" key={g.id} data-age-filter={g.id} aria-pressed={age===g.id} className={age===g.id?'selected':''} onClick={()=>setAge(g.id)}><span>{g.label}</span><strong>{ageCounts[g.id]}</strong></button>)}</div><p className="age-filter-note">Pour choisir, fiez-vous à l’âge précis indiqué sur chaque fiche. Les tranches regroupent les résultats : un même produit peut apparaître dans plusieurs tranches. Les informations et la sécurité restent à vérifier avant la vente.</p></section>
        <div className="collection-toolbar"><div className="category-tabs" role="group" aria-label="Filtrer les catégories">{categories.map(c => <button key={c.id} aria-pressed={category === c.id} className={category === c.id ? "selected" : ""} onClick={() => setCategory(c.id)}>{c.name}</button>)}</div><label className="sort-label"><SlidersHorizontal size={16} /><span className="sr-only">Trier les produits</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="selection">Notre sélection</option><option value="nom">Nom de A à Z</option><option value="prix-croissant">Tarif indicatif croissant</option><option value="prix-decroissant">Tarif indicatif décroissant</option></select></label></div>
        <div className="search-row"><Search size={19} /><label className="sr-only" htmlFor="product-search">Rechercher dans la collection</label><input id="product-search" ref={searchInput} type="search" value={search} placeholder="Un jeu, une idée, une aventure…" onChange={e => setSearch(e.target.value)} /><button className="icon-button" aria-label="Effacer la recherche" onClick={() => { setSearch(""); searchInput.current?.focus(); }}><X size={18} /></button></div>
        <div className="results-line"><span aria-live="polite">{filtered.length} découverte{filtered.length > 1 ? "s" : ""}{favoritesOnly ? " dans vos favoris" : " à explorer"}</span><div>{age !== "tout" && <button className="filter-pill" onClick={() => setAge("tout")}>{age==='age-inconnu'?'Âge non indiqué':ages.find(a => a.id === age)?.label}<X size={13} /></button>}{favoritesOnly && <button className="filter-pill" onClick={() => setFavoritesOnly(false)}>Mes favoris<X size={13} /></button>}</div><span>Photos fournisseur · Ventes fermées</span></div>
        <div className="product-grid">{filtered.map((p, index) => <article className="product-card" key={p.id} data-product-id={p.id}>
          <div className="product-image" style={{ background: p.color }}><button className="product-open" onClick={() => openProduct(p)} aria-label={`Découvrir ${p.name}`}><img src={p.image} alt={`Photo fournisseur : ${p.name}`} width={700} height={700} loading={index < 4 ? "eager" : "lazy"} /></button><span className="age-badge">{p.ageKnown?p.ageLabel.split(' · ')[0]:'Âge non indiqué'}</span><button className={`product-like ${favorites.includes(p.id) ? "liked" : ""}`} onClick={() => like(p.id)} aria-pressed={favorites.includes(p.id)} aria-label={`${favorites.includes(p.id) ? "Retirer" : "Ajouter"} ${p.name} ${favorites.includes(p.id) ? "des" : "aux"} favoris`}><Heart size={19} fill={favorites.includes(p.id) ? "currentColor" : "none"} /></button><button className={`quick-add ${lastAdded === p.id ? "added" : ""}`} onClick={e => add(p, e.currentTarget)} aria-label={`Ajouter ${p.name} au panier d’essai`}>{lastAdded === p.id ? <Check size={18} /> : <Plus size={18} />}</button></div>
          <div className="product-copy"><p>{p.catalogueCategoryLabel||p.subtitle}</p>{ageCoverageLabel(p,age)&&<p className="age-coverage">{ageCoverageLabel(p,age)}</p>}<div><button onClick={() => openProduct(p)} className="product-name">{p.name}</button><span className="product-price-pending">{priceLabel(p)}</span></div></div>
        </article>)}</div>
        {filtered.length === 0 && <div className="empty-state"><Search size={30} strokeWidth={1.2} /><h3>Le petit trésor se cache encore.</h3><p>{age!=='tout'?'Aucune référence ne correspond à cet âge avec vos autres filtres. Les âges manquants restent accessibles dans « Âge non indiqué ».':'Essayez un autre mot ou explorez toute la collection.'}</p><button className="button button-dark" onClick={reset}>Tout découvrir <ArrowRight size={16} /></button></div>}
        <p className="collection-disclaimer">Références fournisseur réelles · L’âge, les précautions et la livraison seront vérifiés avant l’ouverture des ventes.</p>
      </section>

      <ReviewsSummary />
      <section className="story-section" id="notre-univers"><div className="story-art"><img src="/media/univers-mirlipousse.webp" alt="Un monde imaginé en bois clair, papier et couleurs douces" width={1536} height={1024} loading="lazy" /><span className="story-handwritten">Un peu de douceur,<br />beaucoup de possibles.</span></div><div className="story-copy"><p className="eyebrow">BONJOUR, NOUS C’EST MIRLIPOUSSE</p><h2>Laissons grandir<br /><em>l’imagination.</em></h2><p>Un carton devient une fusée. Trois cubes, un château. Et un petit sac, le compagnon d’une très grande expédition.</p><p>Mirlipousse est né d’une idée simple : donner de la place à ces petites histoires qui font l’enfance. Des jeux à inventer, des couleurs à mélanger et un quotidien un peu plus doux.</p><a className="text-link" href="#collection">Entrez dans notre petit monde <ArrowRight size={17} /></a></div></section>

      <section className="values section-wrap"><div><span><Sparkles size={25} strokeWidth={1.2} /></span><h3>De l’espace pour imaginer</h3><p>Des idées de jeux qui laissent la belle place à la curiosité.</p></div><div><span><Gift size={25} strokeWidth={1.2} /></span><h3>Des petits bonheurs à offrir</h3><p>Une collection à explorer par âge, par envie et par occasion.</p></div><div><span><Heart size={25} strokeWidth={1.2} /></span><h3>Des informations claires</h3><p>L’âge, les matières et les précautions seront précisés sur chaque fiche validée.</p></div></section>

      <GuideTeasers />

      <section className="faq section-wrap" id="questions"><div><p className="eyebrow">ON VOUS DIT TOUT</p><h2>Les petites<br /><em>questions.</em></h2></div><div className="faq-list"><details><summary>Puis-je déjà passer une commande ?<ChevronDown size={17} /></summary><p>Pas encore. Vous pouvez découvrir les produits et préparer un panier d’essai. Nous vérifions les informations de chaque référence, les prix livrés et le paiement avant d’ouvrir les commandes.</p></details><details><summary>La boutique sera-t-elle disponible en France et en Belgique ?<ChevronDown size={17} /></summary><p>Ce sont les deux destinations prévues. Les frais, délais, transporteurs et langues nécessaires seront confirmés pour chaque produit avant son ouverture à la vente.</p></details><details><summary>Comment choisir un produit adapté à l’âge ?<ChevronDown size={17} /></summary><p>Le filtre d’âge affiche uniquement les références dont la tranche est renseignée. Si le fournisseur ne précise pas l’âge, la fiche le signale. Consultez toujours les avertissements du fabricant avant de choisir.</p></details><details><summary>Mon panier est-il conservé ?<ChevronDown size={17} /></summary><p>Le panier d’essai et les favoris sont enregistrés uniquement dans votre navigateur, s’il l’autorise. Aucun compte enfant ni renseignement personnel n’est demandé pour cette visite.</p></details></div></section>
    </main>

    <footer><div className="footer-top"><a className="brand" href="/"><span className="brand-icon"><Sprout size={29} strokeWidth={1.5} /></span><span>mirlipousse<span className="brand-dot">.</span><small>LES PETITES GRANDES DÉCOUVERTES</small></span></a><p>Pour les petits.<br />Et les grands moments.</p><div><strong>Dans notre petit monde</strong><a href="#collection">La collection</a><a href="#par-age">Trouver par âge</a><a href="#notre-univers">Notre univers</a></div><div><strong>Une question ?</strong><a href="#questions">Questions fréquentes</a><a href="/livraison-retours">Livraison & retours</a><a href="/ouverture">Préparation de la boutique</a></div></div><nav className="footer-collections" aria-label="Explorer les collections">{collections.map(item => <a href={`/collections/${item.slug}`} key={item.slug}>{item.filter.age ? `Jeux ${item.filter.age} ans` : item.title}</a>)}</nav><div className="footer-bottom"><span>© {new Date().getFullYear()} Mirlipousse · Projet de boutique</span><div><a href="/confidentialite">Confidentialité</a><a href="/mentions-legales">Mentions légales</a><a href="/medias">Médias</a><a href="/contact/">Contact &amp; SAV</a><a href="/commande/merci/">Suivre une commande</a><span>France · Belgique</span></div></div></footer>

    <dialog ref={detailDialog} className="product-dialog" onClose={closeProduct} onClick={e => { if (e.target === e.currentTarget) closeProduct(); }} aria-labelledby="product-dialog-title">{selected && <><button className="dialog-close icon-button" aria-label="Fermer la fiche produit" onClick={closeProduct}><X /></button><div className="detail-image" style={{ background: selected.color }}><img src={selected.image} alt={`Photo fournisseur : ${selected.name}`} width={700} height={700} /></div><div className="detail-copy"><p className="eyebrow">COLLECTION DÉCOUVERTE · {selected.ageLabel}</p><h2 id="product-dialog-title">{selected.name}</h2><p className="detail-price">{priceLabel(selected)}<small>Référence fournisseur · Commandes fermées</small></p><p>{selected.description}</p><p className="age-evidence-detail"><strong>{selected.ageLabel}</strong><span>{selected.ageSource}</span></p><label className="variant-choice">Variante documentée<select value={selectedVariant} onChange={e=>setSelectedVariant(e.target.value)}>{variantsFor(selected).map(v=><option value={v.id} key={v.id}>{v.label}</option>)}</select></label><p className="indicative-note">Tarif de préparation, non contractuel. La variante et le prix définitif seront contrôlés côté serveur avant toute ouverture.</p><ul>{selected.details.map(detail => <li key={detail}><Check size={15} />{detail}</li>)}</ul><div className="detail-note">La photo provient du fournisseur. Les informations manquantes, les précautions et les conditions de livraison seront confirmées avant toute vente.</div><button className={`button button-dark ${lastAdded === selected.id ? "added" : ""}`} onClick={() => add(selected,undefined,selectedVariant)}>{lastAdded === selected.id ? "Ajouté au panier d’essai" : "Ajouter au panier d’essai"} {lastAdded === selected.id ? <Check size={17} /> : <Plus size={17} />}</button><button className="text-link" onClick={() => { setSelected(null); setCartOpen(true); }}>Voir mon panier <ArrowRight size={16} /></button></div></>}</dialog>

    <dialog ref={cartDialog} className="cart-drawer" onClose={() => setCartOpen(false)} onClick={e => { if (e.target === e.currentTarget) setCartOpen(false); }} aria-labelledby="cart-title"><div className="cart-header"><div><p className="eyebrow">VOS PETITES DÉCOUVERTES</p><h2 id="cart-title">Mon panier<span>{quantity}</span></h2></div><button className="icon-button" aria-label="Fermer le panier" onClick={() => setCartOpen(false)}><X /></button></div>{storageError&&<p className="cart-storage-warning">Votre ancien panier ne peut pas être relu. Il est conservé tel quel ; cette nouvelle sélection reste temporaire pour éviter de l’effacer.</p>}{cartLines.length||unresolved.length?<><div className="cart-lines">{cartLines.map(({ product,variantId, quantity: count }) => <article className="cart-line" key={product.id+'|'+variantId}><img src={product.image} alt={`Photo fournisseur : ${product.name}`} style={{ background: product.color }} /><div><h3>{product.name}</h3><p>{variantsFor(product).find(v=>v.id===variantId)?.label||'Ancienne variante à reconfirmer'}</p><div className="quantity-controls"><button aria-label={`Retirer un ${product.name}`} onClick={() => changeQuantity(product.id,variantId, -1)}><Minus size={13} /></button><output aria-label={`Quantité de ${product.name}`}>{count}</output><button aria-label={`Ajouter un ${product.name}`} disabled={count >= 10} onClick={() => changeQuantity(product.id,variantId, 1)}><Plus size={13} /></button></div></div><div className="cart-line-price"><strong>{typeof product.indicativePriceCents==='number'?euros(product.indicativePriceCents*count)+' · indicatif':'À confirmer'}</strong><button onClick={() => setCart(prior => prior.filter(line => !(line.id === product.id&&line.variantId===variantId)))}>Retirer</button></div></article>)}{unresolved.map((line,i)=><article className="unresolved-line" key={i}><h3>Ancienne référence conservée</h3><p>{line.quantity} article(s) ne peuvent pas être rattachés au catalogue actuel. Ils ne sont ni remplacés ni facturés.</p><button type="button" onClick={()=>setUnresolved(old=>old.filter((_,n)=>n!==i))}>Retirer cette ancienne ligne</button></article>)}</div><div className="cart-summary"><div className="subtotal"><span>Sous-total indicatif</span><strong>{anyPriced?euros(subtotal):'Tarifs à confirmer'}{incomplete&&anyPriced?' + tarifs à confirmer':''}</strong></div><p>Tarifs non contractuels, hors livraison tant que le devis ne la confirme pas. Le panier ne réserve aucun stock.</p>{unknownVariant&&<p className="commerce-error">Une ancienne variante doit être reconfirmée sur sa fiche avant estimation.</p>}{cartOpen&&<CommercePanel items={cart.map(line=>({id:line.id,variantId:line.variantId,quantity:line.quantity}))} country={country} setCountry={setCountry} catalogue={remote.catalogue} catalogueError={remote.error} catalogueLoading={remote.loading} onRetryCatalogue={remote.retry} blocked={unresolved.length>0||unknownVariant}/>}<button className="text-link" onClick={() => setCartOpen(false)}>Continuer ma découverte <ArrowRight size={15} /></button></div></> : <div className="cart-empty"><ShoppingBag size={45} strokeWidth={1} /><h3>Les petits bonheurs<br />se trouvent par ici.</h3><p>Votre panier attend ses premières découvertes.</p><button className="button button-dark" onClick={() => { setCartOpen(false); browse(); }}>Explorer la collection <ArrowRight size={17} /></button></div>}</dialog>
    <div className={`toast ${toast ? "visible" : ""}`} role="status" aria-live="polite">{toast && <><Check size={16} />{toast}</>}</div>
  </>;
}
