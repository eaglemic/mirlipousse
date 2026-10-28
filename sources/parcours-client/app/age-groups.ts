/** Tranches de recherche seulement : l’âge précis du fournisseur reste visible. */
export const AGE_GROUPS=[{id:'0-2',label:'0–2 ans'},{id:'3-5',label:'3–5 ans'},{id:'6-8',label:'6–8 ans'},{id:'9-12',label:'9–12 ans'}] as const;
export type AgeCoverage={group:string;coveredIntegerAges:number[];fullBandCovered:boolean};
export type AgeEvidence={id:string;pid:string;vid:string;ageKnown:boolean;ageLabel:string;ageGroups:string[];ageGroupCoverage:AgeCoverage[];ageSource:string;qualificationStatus:string};
export type AgeAnnotated={ageKnown?:boolean;ageGroups?:string[];ageGroupCoverage?:AgeCoverage[]};
export function readAgeEvidence(value:any):Map<string,AgeEvidence>{
 if(value?.format!=='mirlipousse-ages-public/1'||!Array.isArray(value.products)||value.products.length!==30)throw Error('AGE_EVIDENCE_INVALID');
 const result=new Map<string,AgeEvidence>();const groups=new Set<string>(AGE_GROUPS.map(g=>g.id));
 for(const item of value.products){
  if(typeof item.pid!=='string'||typeof item.vid!=='string'||typeof item.id!=='string'||typeof item.ageKnown!=='boolean'||typeof item.ageLabel!=='string'||!item.ageLabel||typeof item.ageSource!=='string'||!Array.isArray(item.ageGroups)||!Array.isArray(item.ageGroupCoverage)||item.ageGroups.some((g:any)=>!groups.has(g))||new Set(item.ageGroups).size!==item.ageGroups.length||item.ageQualified!==false||item.safetyQualified!==false||item.purchaseEnabled!==false||item.checkoutEligible!==false)throw Error('AGE_EVIDENCE_INVALID');
  if(!item.ageKnown&&(item.ageGroups.length||item.ageMinYears!==null||item.ageMaxYears!==null))throw Error('AGE_UNKNOWN_ASSIGNED');
  if(item.ageKnown&&(!Number.isFinite(item.ageMinYears)||item.ageMinYears<0||item.ageMaxYears!==null&&(!Number.isFinite(item.ageMaxYears)||item.ageMaxYears<item.ageMinYears)||!item.sourceExcerpt))throw Error('AGE_SOURCE_REQUIRED');
  for(const c of item.ageGroupCoverage)if(!item.ageGroups.includes(c.group)||!Array.isArray(c.coveredIntegerAges)||!c.coveredIntegerAges.length||c.coveredIntegerAges.some((a:any)=>!Number.isInteger(a)||a<item.ageMinYears||item.ageMaxYears!==null&&a>item.ageMaxYears)||typeof c.fullBandCovered!=='boolean')throw Error('AGE_COVERAGE_INVALID');
  const key=item.pid.toUpperCase();if(result.has(key))throw Error('AGE_PID_DUPLICATE');result.set(key,item);
 }
 return result;
}
export function matchesAge(product:AgeAnnotated,filter:string){return filter==='tout'||filter==='age-inconnu'?filter==='tout'||product.ageKnown!==true:(product.ageGroups||[]).includes(filter);}
export function countAges(products:AgeAnnotated[]){const counts:Record<string,number>={tout:products.length,'age-inconnu':0};for(const g of AGE_GROUPS)counts[g.id]=0;for(const p of products){if(!p.ageKnown)counts['age-inconnu']++;for(const id of p.ageGroups||[])if(id in counts)counts[id]++;}return counts;}
export function ageCoverageLabel(product:AgeAnnotated,filter:string){const coverage=product.ageGroupCoverage?.find(c=>c.group===filter);if(!coverage||coverage.fullBandCovered)return '';const ages=coverage.coveredIntegerAges;return 'Dans cette tranche : '+(ages.length===1?ages[0]+' ans':ages[0]+'–'+ages[ages.length-1]+' ans');}
