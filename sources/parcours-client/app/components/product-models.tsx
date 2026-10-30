import type {ProductVariant} from '../lib/catalogue';

type ModelOptions = readonly ProductVariant[];

export function ProductModelsBadge({productName, options, onOpen}: {
  productName: string; options: ModelOptions; onOpen: () => void;
}) {
  if (options.length < 2) return null;
  return <button type="button" className="product-models-badge" onClick={onOpen}
    aria-haspopup="dialog" aria-controls="product-detail-dialog"
    aria-label={`Voir les ${options.length} modèles de ${productName}`}>
    <span className="models-badge-dot" aria-hidden="true" />{options.length} modèles
  </button>;
}

export function ProductModelImage({productName, option}: {
  productName: string; option: ProductVariant | null;
}) {
  return option?.image
    ? <img src={option.image} alt={option.imageAlt || `${productName} — ${option.label}`} width={700} height={700} />
    : <p>Photo de cette ancienne variante à reconfirmer.</p>;
}

export function ProductModelChoices({productName, options, selectedId, onSelect}: {
  productName: string; options: ModelOptions; selectedId: string; onSelect: (id: string) => void;
}) {
  if (!options.length) return null;
  const selected = options.find(option => option.id === selectedId);
  return <fieldset className="model-choice">
    <legend>{options.length > 1 ? `${options.length} modèles à choisir` : 'Modèle documenté'}</legend>
    <p className="model-selection" aria-live="polite">{selected ? `Modèle sélectionné : ${selected.label}` : 'Choisissez un modèle documenté.'}</p>
    <div className="model-options">
      {options.map(option => <button type="button" key={option.id} data-variant-id={option.id}
        className="model-option" aria-pressed={option.id === selectedId}
        aria-label={`Choisir ${option.label} pour ${productName}`} onClick={() => onSelect(option.id)}>
        {option.image
          ? <img src={option.image} alt={option.imageAlt || `${productName} — ${option.label}`} width={88} height={88} loading="lazy" decoding="async" />
          : <span className="model-option-no-image">Photo à confirmer</span>}
        <span className="model-option-label">{option.label}</span>
        {option.id === selectedId && <span className="model-option-selected" aria-hidden="true">✓</span>}
      </button>)}
    </div>
    <details className="model-option-list"><summary>Choisir dans la liste des modèles</summary>
      <label className="variant-choice">Variante documentée<select value={selectedId} onChange={event => onSelect(event.target.value)}>
        {options.map(option => <option value={option.id} key={option.id}>{option.label}</option>)}
      </select></label>
    </details>
  </fieldset>;
}
