import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {products} from '../app/lib/catalogue.ts';
import Storefront from '../app/storefront.tsx';

// Only this historical packaging label was already public before this lot.
// Four marketed age intervals remain useful for filtering, never new badges.
const visibleHistorical='mm-p-823e50754eaf2e54744e3eb4ba764152e87c19283266142e89d337ec6a1b2b84';
test('29 unknown or neutralized labels never become ages inferred from groups',()=>{
 const hidden=products.filter(p=>p.id!==visibleHistorical);
 assert.equal(hidden.length,29);assert.equal(hidden.filter(p=>p.ageKnown).length,4);
 assert.equal(hidden.filter(p=>!p.ageKnown).length,25);
 for(const product of hidden)assert.equal(product.ageLabel,'');
 const known=products.find(p=>p.id===visibleHistorical)!;
 assert.equal(known.ageLabel,'6 ans et plus');
 assert.equal(products.reduce((n,p)=>n+p.variants!.length,0),204);
});
test('public cards hide preparation notes and provenance without removing real existing age',()=>{
 const html=renderToString(React.createElement(Storefront));
 assert.equal((html.match(/class="age-badge"/g)||[]).length,1);
 assert(html.includes('6 ans et plus'));
 assert(!/Âge à confirmer|Âge d’utilisation non communiqué|Cette information reste à vérifier avant la vente|age-evidence-detail|Âge non indiqué par la fiche article/.test(html));
 assert(html.includes('Les commandes sont actuellement fermées.'));
});
