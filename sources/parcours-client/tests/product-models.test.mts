import test from 'node:test';
import assert from 'node:assert/strict';
import React, {Children, isValidElement, type ReactElement, type ReactNode} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {products, type ProductVariant} from '../app/lib/catalogue.ts';
import {productVariants, selectedOption, addTrialLine} from '../app/variant-selection.ts';
import {restoreCart} from '../app/cart-state.ts';
import Storefront from '../app/storefront.tsx';
import {ProductModelsBadge, ProductModelChoices, ProductModelImage} from '../app/components/product-models.tsx';

const puzzle = products.find(product => /puzzle/i.test(product.name) && productVariants(product).length > 1)!;
type ButtonProps = {children?: ReactNode; onClick: () => void; 'data-variant-id'?: string};
function buttons(node: ReactNode): ReactElement<ButtonProps>[] {
  const found: ReactElement<ButtonProps>[] = [];
  Children.forEach(node, child => {
    if (!isValidElement<{children?: ReactNode}>(child)) return;
    if (child.type === 'button') found.push(child as ReactElement<ButtonProps>);
    found.push(...buttons(child.props.children));
  });
  return found;
}

test('le badge compte les vrais modèles, reste absent à zéro/un et appelle l’ouverture existante', () => {
  assert(puzzle);
  let opened = 0;
  const options = productVariants(puzzle);
  for (const list of [[], options.slice(0, 1)]) {
    assert.equal(renderToStaticMarkup(React.createElement(ProductModelsBadge, {productName: puzzle.name, options: list, onOpen: () => opened++})), '');
  }
  const badge = ProductModelsBadge({productName: puzzle.name, options, onOpen: () => opened++})!;
  const html = renderToStaticMarkup(badge);
  assert(html.includes(`${options.length} modèles`));
  assert(html.includes('aria-haspopup="dialog"')); assert(html.includes('aria-controls="product-detail-dialog"'));
  buttons(badge)[0].props.onClick(); assert.equal(opened, 1);
});

test('la vraie vitrine SSR expose un badge par produit à choix multiples et la cible du dialogue', () => {
  const html = renderToStaticMarkup(React.createElement(Storefront));
  const expected = products.filter(product => productVariants(product).length > 1).length;
  assert.equal((html.match(/class="product-models-badge"/g) || []).length, expected);
  assert(html.includes('id="product-detail-dialog"'));
  for (const product of products.filter(product => productVariants(product).length > 1)) {
    assert(html.includes(`Voir les ${productVariants(product).length} modèles de ${product.name.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}`));
  }
});

test('chaque option réelle garde son ID opaque, sa photo et son libellé dans grille et liste native', () => {
  for (const product of products) {
    const options = productVariants(product);
    const before = structuredClone(options);
    const html = renderToStaticMarkup(React.createElement(ProductModelChoices, {productName: product.name, options, selectedId: product.defaultVariantId, onSelect: () => {}}));
    assert.equal((html.match(/data-variant-id=/g) || []).length, options.length);
    assert.equal((html.match(/<option value=/g) || []).length, options.length);
    assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1);
    for (const option of options) {
      assert.match(option.id, /^mm-v-[a-f0-9]{64}$/);
      assert(html.includes(`data-variant-id="${option.id}"`));
      assert(html.includes(`value="${option.id}"`));
      assert(html.includes(`src="${option.image}"`));
    }
    assert.deepEqual(options, before);
  }
});

test('le vrai callback miniature sélectionne exactement l’option et synchronise aperçu, aria et panier conservé', () => {
  const options = productVariants(puzzle);
  let selectedId = puzzle.defaultVariantId;
  for (const option of options) {
    const tree = ProductModelChoices({productName: puzzle.name, options, selectedId, onSelect: value => {selectedId = value;}});
    const button = buttons(tree).find(element => element.props['data-variant-id'] === option.id)!;
    assert(button); button.props.onClick(); assert.equal(selectedId, option.id);
    const selected = selectedOption(puzzle, selectedId)!;
    const image = renderToStaticMarkup(React.createElement(ProductModelImage, {productName: puzzle.name, option: selected}));
    assert(image.includes(`src="${option.image}"`));
    const chosen = renderToStaticMarkup(React.createElement(ProductModelChoices, {productName: puzzle.name, options, selectedId, onSelect: () => {}}));
    assert.equal((chosen.match(/aria-pressed="true"/g) || []).length, 1);
    assert(chosen.includes(`data-variant-id="${option.id}" class="model-option" aria-pressed="true"`));
    const cart = addTrialLine([], puzzle, selectedId);
    assert.deepEqual(restoreCart(JSON.parse(JSON.stringify(cart)), products).lines, [{id: puzzle.id, variantId: option.id, quantity: 1}]);
  }
});

test('une ancienne option inconnue ne sélectionne aucune miniature ni photo de remplacement', () => {
  const options = productVariants(puzzle);
  const html = renderToStaticMarkup(React.createElement(ProductModelChoices, {productName: puzzle.name, options, selectedId: 'ancienne-inconnue', onSelect: () => {}}));
  assert(!html.includes('aria-pressed="true"'));
  assert(html.includes('Choisissez un modèle documenté.'));
  for (const option of [null, {...options[0], image: undefined}]) {
    const image = renderToStaticMarkup(React.createElement(ProductModelImage, {productName: puzzle.name, option}));
    assert(!image.includes('<img')); assert(image.includes('Photo de cette ancienne variante à reconfirmer.'));
  }
});

test('les libellés restent du texte et les options fermées restent seulement sélectionnables', () => {
  const option: ProductVariant = {...productVariants(puzzle)[0], label: '<script>modèle</script>', imageAlt: '<photo>', availableForCheckout: false};
  const html = renderToStaticMarkup(React.createElement(ProductModelChoices, {productName: puzzle.name, options: [option], selectedId: option.id, onSelect: () => {}}));
  assert(html.includes('&lt;script&gt;modèle&lt;/script&gt;')); assert(!html.includes('<script>'));
  assert(html.includes('alt="&lt;photo&gt;"')); assert(!html.includes('disabled=""'));
  assert.equal(option.availableForCheckout, false);
});
