/* Vitrines fermées : aucune route de paiement ou commande. */
(() => {
  'use strict';
  const config = JSON.parse(document.getElementById('brand-data').textContent);
  if (!/^[a-z0-9-]+$/.test(config.brandSlug) || config.salesEnabled !== false) throw new Error('Configuration de présentation invalide');
  document.body.classList.add('js');
  const products = new Map(config.products.map(product => [product.id, product]));
  const storageKey = `boutique:${config.brandSlug}:selection:v1`;
  const adultKey = `boutique:${config.brandSlug}:adult:v1`;
  let chosen = [];
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* La sélection reste utilisable en mémoire. */ } };
  try { const parsed = JSON.parse(read(storageKey) || '[]'); chosen = Array.isArray(parsed) ? [...new Set(parsed)].filter(id => typeof id === 'string' && products.has(id)).slice(0, 50) : []; } catch { chosen = []; }
  const dialog = document.getElementById('selection');
  const feedback = document.getElementById('feedback');
  let feedbackTimer;
  function announce(text) { clearTimeout(feedbackTimer); feedback.textContent = text; feedbackTimer = setTimeout(() => { feedback.textContent = ''; }, 4500); }
  function render() {
    document.querySelectorAll('[data-count]').forEach(node => { node.textContent = String(chosen.length); });
    const list = document.getElementById('selection-items'); list.replaceChildren();
    document.getElementById('selection-empty').hidden = chosen.length > 0;
    document.getElementById('selection-clear').hidden = chosen.length === 0;
    chosen.forEach(id => {
      const product = products.get(id), item = document.createElement('li'), photo = document.createElement('img'), name = document.createElement('span'), remove = document.createElement('button');
      photo.src = product.image; photo.alt = ''; photo.width = 60; photo.height = 60;
      name.textContent = `${product.name} — Prix à venir`;
      remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', `Retirer ${product.name}`);
      remove.addEventListener('click', () => { chosen = chosen.filter(value => value !== id); write(storageKey, JSON.stringify(chosen)); render(); announce('Référence retirée de votre sélection.'); });
      item.append(photo, name, remove); list.append(item);
    });
  }
  document.querySelectorAll('.add-selection').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.product; if (!products.has(id)) return;
    if (!chosen.includes(id)) chosen.push(id);
    write(storageKey, JSON.stringify(chosen)); render(); announce('Ajouté à votre sélection. Aucun achat effectué.');
  }));
  document.querySelectorAll('.selection-toggle').forEach(button => button.addEventListener('click', () => { render(); dialog.showModal(); }));
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  document.getElementById('selection-clear').addEventListener('click', () => { chosen = []; write(storageKey, '[]'); render(); announce('Votre sélection a été vidée.'); });
  const menu = document.querySelector('.menu-toggle'), navigation = document.getElementById('navigation');
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('open', open); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.focus(); } });
  let category = 'all', audience = 'all';
  function applyFilters() {
    let visible = 0;
    document.querySelectorAll('.filter-item').forEach(item => {
      const categoryOK = category === 'all' || item.dataset.category === category;
      const audienceOK = audience === 'all' || (item.dataset.audience || '').split(' ').includes(audience);
      item.hidden = !categoryOK || !audienceOK;
      if (!item.hidden) visible++;
    });
    const count = document.getElementById('filter-count'), empty = document.getElementById('filter-empty');
    if (count) count.textContent = `${visible} référence${visible > 1 ? 's' : ''} affichée${visible > 1 ? 's' : ''}`;
    if (empty) empty.hidden = visible !== 0;
    document.querySelectorAll('[data-filter]').forEach(button => { const active = button.dataset.filter === category; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    document.querySelectorAll('[data-audience-filter]').forEach(button => { const active = button.dataset.audienceFilter === audience; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; applyFilters(); }));
  document.querySelectorAll('[data-audience-filter]').forEach(button => button.addEventListener('click', () => { audience = button.dataset.audienceFilter; applyFilters(); }));
  if (config.adultOnly === true) {
    if (config.brandSlug !== 'nuitrelia') throw new Error('Univers adulte incohérent');
    const gate = document.getElementById('adult-gate');
    document.getElementById('adult-confirm').addEventListener('click', () => { write(adultKey, 'declared-18'); gate.close(); });
    if (read(adultKey) !== 'declared-18') { gate.addEventListener('cancel', event => event.preventDefault()); gate.showModal(); }
  }
  render();
})();
/* Avis : activation explicite après qualification du stockage et de l’origine. */
(async () => {
  const form = document.getElementById('site-review');
  if (!form) return;
  const config = JSON.parse(document.getElementById('brand-data').textContent);
  const settings = config.reviews || {}, state = document.getElementById('review-state'), area = document.getElementById('reviews-public');
  form.addEventListener('submit', event => event.preventDefault());
  if (settings.enabled !== true || typeof settings.endpoint !== 'string') return;
  let endpoint;
  try { endpoint = new URL(settings.endpoint, location.origin); if (endpoint.protocol !== 'https:') return; } catch { return; }
  const fieldset = form.querySelector('fieldset'), button = form.querySelector('button[type=submit]');
  const say = text => { state.textContent = text; };
  const publicError = () => {
    area.replaceChildren(); const title = document.createElement('h3'), p = document.createElement('p'); title.textContent = 'Les avis sont momentanément indisponibles'; p.textContent = 'Aucun résultat de chargement n’est supposé. Vous pourrez réessayer plus tard.'; area.append(title, p);
    say('Le dépôt est momentanément indisponible. Aucun avis n’a été envoyé.');
  };
  try {
    const url = new URL(endpoint); url.searchParams.set('brand', config.brandSlug);
    const response = await fetch(url, {headers:{Accept:'application/json'},credentials:'omit',cache:'no-store'});
    if (!response.ok) throw new Error('GET refusé');
    const data = await response.json();
    if (data.brand !== config.brandSlug || !Number.isInteger(data.count) || data.count < 0 || !Array.isArray(data.reviews) || data.reviews.length > 20 || data.reviews.length > data.count || (data.count === 0 ? data.average !== null : !Number.isFinite(data.average) || data.average < 1 || data.average > 5)) throw new Error('Réponse avis incohérente');
    const verified = data.reviews.every(r => typeof r.id === 'string' && Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5 && typeof r.comment === 'string' && r.comment.length <= 1000 && (r.pseudonym === null || typeof r.pseudonym === 'string') && typeof r.createdAt === 'string');
    if (!verified) throw new Error('Liste avis incohérente');
    area.replaceChildren();
    const heading = document.createElement('h3'); heading.textContent = data.count === 0 ? 'Premier avis' : `${data.average.toLocaleString('fr-FR', {maximumFractionDigits:1})} sur 5`;
    const summary = document.createElement('p'); summary.textContent = data.count === 0 ? 'Aucun avis publié pour le moment.' : `${data.count} avis publiés sur l’expérience de ce site.`;
    area.append(heading, summary);
    for (const review of data.reviews) {
      const article = document.createElement('article'), note = document.createElement('p'), text = document.createElement('p'), by = document.createElement('p'); article.className = 'published-review'; note.textContent = `${review.rating} sur 5`; text.textContent = review.comment; by.className = 'small'; by.textContent = review.pseudonym || 'Visiteur'; article.append(note, text, by); area.append(article);
    }
    document.getElementById('review-data-notice').textContent = 'Votre avis et votre pseudonyme éventuel sont transmis pour modération. Ne partagez aucune information personnelle ou intime.';fieldset.disabled = false; button.disabled = false; button.textContent = 'Envoyer mon avis'; button.style.opacity = '1';
    say('Votre avis sur le site sera relu avant sa publication.');
    form.addEventListener('submit', async event => {
      event.preventDefault(); if (!form.reportValidity() || button.disabled) return;
      const payload = {brand:config.brandSlug,rating:Number(form.elements.rating.value),pseudonym:form.elements.pseudonym.value.trim(),comment:form.elements.comment.value.trim(),consentPublication:form.elements.consentPublication.checked,honeypot:''};
      if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5 || payload.pseudonym.length > 40 || payload.comment.length < 10 || payload.comment.length > 1000 || payload.consentPublication !== true) {say('Vérifiez la note, le commentaire et l’accord de publication.');return;}
      button.disabled = true; say('Envoi en cours…');
      try {
        const response = await fetch(endpoint, {method:'POST',credentials:'omit',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)});
        const data = await response.json();
        if (response.status !== 201 || data.received !== true || data.status !== 'pending' || typeof data.id !== 'string' || !/^[A-Za-z0-9-]{10,80}$/.test(data.id)) {
          const messages = {INVALID_INPUT:'Vérifiez les champs de votre avis.',ORIGIN_DENIED:'Le dépôt est fermé depuis cette adresse du site.',RATE_LIMITED:'Trop de tentatives : patientez avant de réessayer.',REVIEWS_UNAVAILABLE:'Le dépôt est temporairement indisponible.'};
          say(messages[data.error?.code] || 'L’envoi de votre avis n’a pas été confirmé.');button.disabled = false;return;
        }
        form.reset();fieldset.disabled = true; say(`Merci, votre avis a été reçu. Il sera visible après modération. Référence : ${data.id}. Conservez-la pour demander son retrait.`);button.textContent = 'Avis transmis pour relecture';
      } catch {say('La réception n’est pas confirmée. Aucun renvoi automatique n’est effectué.');button.disabled = false;}
    });
  } catch { publicError(); }
})();

/* Présentation seulement : aucun réseau, prix, paiement ou stockage supplémentaire. */
(() => {
  'use strict';
  const root=document.documentElement;
  if(root.dataset.motionStudio)return;
  const preference=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
  const running=new Set(),seen=new WeakSet();let observer=null;
  function animate(node,frames,options){
    if(preference?.matches||document.hidden||typeof node.animate!=='function')return;
    try{const animation=node.animate(frames,{fill:'none',...options});running.add(animation);animation.finished.then(()=>running.delete(animation),()=>running.delete(animation));return animation;}catch{/* Le contenu et les contrôles restent disponibles sans motion. */}
  }
  function stop(){for(const animation of running)animation.cancel();running.clear();observer?.disconnect();observer=null;}
  function update(){
    root.dataset.motionPaused=String(document.hidden);
    if(preference?.matches){root.dataset.motionStudio='reduced';stop();return;}
    if(document.hidden){root.dataset.motionStudio='paused';stop();return;}
    root.dataset.motionStudio='active';
    if(observer||typeof IntersectionObserver!=='function')return;
    const targets=Array.from(document.querySelectorAll('.product-card,.section-heading,.ritual-strip>div,.guide-promo>div,.three-columns>div,.reviews-heading,.reviews-grid>* , .prose>section,.age-card')).slice(0,80);
    const order=new WeakMap(targets.map((node,index)=>[node,index]));
    observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting||seen.has(entry.target))continue;
        seen.add(entry.target);entry.target.dataset.motionRevealed='true';
        animate(entry.target,[{opacity:.45,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:560,delay:(order.get(entry.target)%3)*65,easing:'cubic-bezier(.2,.7,.2,1)'});
        observer?.unobserve(entry.target);
      }
    },{threshold:.08,rootMargin:'0px 0px -24px 0px'});
    for(const node of targets)if(!seen.has(node))observer.observe(node);
  }
  document.querySelectorAll('.add-selection,.selection-toggle,.filter').forEach(button=>button.addEventListener('click',()=>{
    animate(button,[{transform:'scale(1)'},{transform:'scale(.95)'},{transform:'scale(1)'}],{duration:230,easing:'ease-out'});
  }));
  document.querySelectorAll('details').forEach(node=>node.addEventListener('toggle',()=>{if(node.open)for(const child of node.children)if(child.tagName!=='SUMMARY')animate(child,[{opacity:.6,transform:'translateY(-4px)'},{opacity:1,transform:'none'}],{duration:180,easing:'ease-out'});}));
  if(typeof MutationObserver==='function'){
    const modals=new MutationObserver(records=>{for(const record of records)if(record.target.open)animate(record.target,[{opacity:.75,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:190,easing:'ease-out'});});
    document.querySelectorAll('dialog').forEach(dialog=>modals.observe(dialog,{attributes:true,attributeFilter:['open']}));
  }
  preference?.addEventListener?.('change',update);document.addEventListener('visibilitychange',update);update();
})();
