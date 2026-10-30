import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readAgeEvidence,matchesAge,countAges,ageCoverageLabel} from '../app/age-groups.ts';
const source=()=>JSON.parse(readFileSync(new URL('../app/lib/age-evidence-public.json',import.meta.url),'utf8'));
test('current documented ages retain exact overlap and unknown products remain outside age bands',()=>{
 const data=source(),products=[...readAgeEvidence(data).values()];
 assert.equal(products.length,31);
 const two=products.find(p=>p.id==='mm-p-815ce8de9c4b71f2e0256fa1f5652074166304c369b58ac924b2502ec45a6411')!;
 assert.equal(matchesAge(two,'0-2'),true);assert.equal(ageCoverageLabel(two,'0-2'),'Dans cette tranche : 2 ans');
 const four=products.find(p=>p.id==='mm-p-0d6bbc93ab1278d3eba2af5a6874f4887a6b734ef2dd7048fe7a65211db1391e')!;
 assert.deepEqual(four.ageGroups,['3-5','6-8']);assert.equal(ageCoverageLabel(four,'6-8'),'Dans cette tranche : 6 ans');
 for(const product of products.filter(p=>!p.ageKnown))assert.equal(matchesAge(product,'0-2'),false);
 const bag=products.find(p=>p.id==='mm-p-b6849588037d268d287c9bdda053281b8cb33f647cc06dd24ca98c715fe431c9')!;assert.equal(products.filter(p=>p.ageKnown).length,6);assert.deepEqual(bag.ageGroups,['3-5','6-8']);assert.equal(matchesAge(bag,'0-2'),false);assert.equal(ageCoverageLabel(bag,'6-8'),'Dans cette tranche : 6 ans');
 const {tout,...counts}=countAges(products);assert.equal(tout,31);assert.deepEqual(counts,data.groupCounts);
 const reordered=source();for(const p of reordered.products)p.ageGroupCoverage=p.ageGroupCoverage.map((c:any)=>Object.fromEntries(Object.entries(c).reverse()));assert.equal(readAgeEvidence(reordered).size,31);
});
test('interval contradictions, missing coverage and false full-band claims are rejected',()=>{
 const mutate=[
  (p:any)=>{p.ageGroups=['0-2'];p.ageGroupCoverage=[];},
  (p:any)=>{p.ageGroupCoverage=[];},
  (p:any)=>{p.ageGroupCoverage[0].coveredIntegerAges=[9];},
  (p:any)=>{p.ageGroupCoverage[0].fullBandCovered=false;},
 ];
 for(const change of mutate){const data=source(),six=data.products.find((p:any)=>p.ageKnown&&p.ageMinYears===6);change(six);assert.throws(()=>readAgeEvidence(data),/AGE_COVERAGE_CONFLICT/);}
});
