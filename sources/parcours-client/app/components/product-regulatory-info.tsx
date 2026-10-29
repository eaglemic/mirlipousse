import type {Variant} from '../commerce-client';

/** Seuls les champs réglementaires relus de l'option choisie sont affichés. */
export default function ProductRegulatoryInfo({variant}:{variant:Variant|null|undefined}){
 if(!variant?.availableForCheckout||!variant.regulatory)return null;
 const info=variant.regulatory;
 return <section className="product-regulatory-info" aria-label="Fabricant et sécurité de cette variante"><h3>Informations du produit</h3><dl><dt>Fabricant</dt><dd>{info.manufacturer}</dd><dt>Responsable dans l’Union européenne</dt><dd>{info.responsibleEU}</dd>{info.ageLabel&&<><dt>Âge ou usage indiqué par le fabricant</dt><dd>{info.ageLabel}</dd></>}<dt>Avertissements et précautions</dt><dd>{info.warnings}</dd></dl></section>;
}
