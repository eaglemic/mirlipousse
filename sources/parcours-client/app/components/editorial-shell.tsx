import BrandWordmark from "./brand-wordmark";
import { ArrowLeft, ArrowRight, Sprout } from "lucide-react";
import { collections, guidesArray } from "../lib/editorial";
import { absoluteUrl, schemaJson } from "../lib/seo";

export function EditorialHeader() {
  return <><div className="announcement"><span>Des petits riens qui font grandir les grands rêves.</span><span>France & Belgique ↗</span></div><header className="editorial-header"><a href="/" className="brand" aria-label="Mini & Merveilles, accueil"><span className="brand-icon"><Sprout size={29} strokeWidth={1.5} /></span><BrandWordmark/></a><nav aria-label="Navigation principale"><a href="/#collection">La collection</a><a href="/guides">Le carnet d’idées</a><a href="/#notre-univers">Notre univers</a></nav></header></>;
}

const LEGAL_LINKS = [
  ["/informations-legales/", "Informations légales"],
  ["/cgv/", "CGV"],
  ["/livraison-retours/", "Livraison & retours"],
  ["/retractation/", "Rétractation"],
  ["/garanties/", "Garanties"],
  ["/mediation/", "Médiation"],
  ["/confidentialite/", "Confidentialité"],
  ["/cookies/", "Cookies"],
  ["/mentions-legales/", "Mentions légales"],
  ["/contact/", "Contact & SAV"],
  ["/commande/merci/", "Suivre une commande"],
] as const;

export function LegalFooterLinks() {
  return <nav className="legal-footer-nav" aria-label="Informations légales et service client">{LEGAL_LINKS.map(([href, label]) => <a href={href} key={href}>{label}</a>)}</nav>;
}

export function EditorialFooter() {
  return <footer className="editorial-footer"><a className="brand" href="/"><BrandWordmark/></a><p>Laissons grandir l’imagination.</p><nav aria-label="Découvrir la boutique"><a href="/guides">Le carnet d’idées</a><a href="/medias">Médias</a></nav><LegalFooterLinks/><small>Collection en préparation · Achats non ouverts</small></footer>;
}

export function Breadcrumbs({ label, path, parent }: { label: string; path: string; parent?: { label: string; path: string } }) {
  const items = [{ label: "Accueil", path: "/" }, ...(parent ? [parent] : []), { label, path }];
  return <><nav className="breadcrumbs" aria-label="Fil d’Ariane"><ol>{items.map((item, index) => <li key={item.path}>{index > 0 && <span aria-hidden="true">/</span>}{index === items.length - 1 ? <span aria-current="page">{item.label}</span> : <a href={item.path}>{item.label}</a>}</li>)}</ol></nav><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, item: absoluteUrl(item.path) })) }) }} /></>;
}

export function RelatedCollections({ slugs }: { slugs: string[] }) {
  const items = slugs.map(slug => collections.find(collection => collection.slug === slug)).filter(Boolean);
  return <section className="related-section"><p className="eyebrow">ENCORE UN PEU DE CURIOSITÉ</p><h2>D’autres petits mondes.</h2><div className="related-grid">{items.map(item => <a key={item!.slug} href={`/collections/${item!.slug}`}><Sprout size={22} strokeWidth={1.2} /><span>{item!.title}</span><ArrowRight size={18} /></a>)}</div></section>;
}

export function GuideTeasers() {
  return <section className="guide-teasers section-wrap"><div className="section-intro"><div><p className="eyebrow">LE CARNET DES PETITES IDÉES</p><h2>Et si on jouait<br /><em>autrement ?</em></h2></div><a href="/guides" className="text-link">Ouvrir le carnet <ArrowRight size={16} /></a></div><div className="guide-teaser-grid">{guidesArray.map((guide, index) => <a className="guide-teaser" key={guide.slug} href={`/guides/${guide.slug}`}><div className={`guide-teaser-art art-${index}`}><img src="/media/univers-mirlipousse.webp" alt="Illustration d’un paysage de jouets et d’imagination Mini & Merveilles" width={1536} height={1024} loading="lazy" /></div><div><p className="eyebrow">{guide.eyebrow}</p><h3>{guide.title}</h3><p>{guide.description}</p><span className="text-link">Lire le guide <ArrowRight size={16} /></span></div></a>)}</div></section>;
}
