import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readAgeEvidence,matchesAge,countAges,ageCoverageLabel} from '../app/age-groups.ts';
const source=()=>JSON.parse(readFileSync(new URL('../app/lib/age-evidence-public.json',import.meta.url),'utf8'));
test('current documented ages retain exact overlap and unknown products remain outside age bands',()=>{
 const data=source(),products=[...readAgeEvidence(data).values()];
 assert.equal(products.length,30);
 const two=products.find(p=>p.pid==='7D9CB8A7-0917-47FC-825E-C26CAB320373')!;
 assert.equal(matchesAge(two,'0-2'),true);assert.equal(ageCoverageLabel(two,'0-2'),'Dans cette tranche : 2 ans');
 const four=products.find(p=>p.pid==='1765008428654661632')!;
 assert.deepEqual(four.ageGroups,['3-5','6-8']);assert.equal(ageCoverageLabel(four,'6-8'),'Dans cette tranche : 6 ans');
 for(const product of products.filter(p=>!p.ageKnown))assert.equal(matchesAge(product,'0-2'),false);
 const bag=products.find(p=>p.pid==='1677148647701618688')!;assert.equal(products.filter(p=>p.ageKnown).length,5);assert.deepEqual(bag.ageGroups,['3-5','6-8']);assert.equal(matchesAge(bag,'0-2'),false);assert.equal(ageCoverageLabel(bag,'6-8'),'Dans cette tranche : 6 ans');
 const {tout,...counts}=countAges(products);assert.equal(tout,30);assert.deepEqual(counts,data.groupCounts);
 const reordered=source();for(const p of reordered.products)p.ageGroupCoverage=p.ageGroupCoverage.map((c:any)=>Object.fromEntries(Object.entries(c).reverse()));assert.equal(readAgeEvidence(reordered).size,30);
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
