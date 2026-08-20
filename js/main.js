
/* ============================================================
   Cortex Play Store — main.js
   Panier, wishlist, recherche, animations, DB bridge
   ============================================================ */

/* ---- UTILS ---- */
const fmt = n => n.toLocaleString('fr-FR') + ' €';
const stars = r => { const f=Math.round(r); return '★'.repeat(f)+'☆'.repeat(5-f); };
const heartSVG = on => on
  ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="var(--err)"><path d="M12 20s-7-4.4-9.3-8.3C1.2 9 2.2 6 5 6c1.9 0 3 1 3.5 2C9 7 10.1 6 12 6s3 1 3.5 2C16 7 17.1 6 19 6c2.8 0 3.8 3 2.3 5.7C19 15.6 12 20 12 20Z"/></svg>'
  : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 20s-7-4.4-9.3-8.3C1.2 9 2.2 6 5 6c1.9 0 3 1 3.5 2C9 7 10.1 6 12 6s3 1 3.5 2C16 7 17.1 6 19 6c2.8 0 3.8 3 2.3 5.7C19 15.6 12 20 12 20Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';

/* ---- THEME ---- */
const THEME_KEY = 'gp_theme';
function getTheme(){ return localStorage.getItem(THEME_KEY)||'dark'; }
function applyTheme(t){ document.documentElement.setAttribute('data-theme',t); localStorage.setItem(THEME_KEY,t); updateThemeBtn(); }
function toggleTheme(){ applyTheme(getTheme()==='dark'?'light':'dark'); }
function updateThemeBtn(){ const b=document.getElementById('theme-toggle'); if(b) b.innerHTML = getTheme()==='dark'?'☀':'☾'; }

/* ---- DB BRIDGE ---- */
function getProducts(){ return (typeof dbGet!=="undefined")?dbGet():(typeof CATALOG!=="undefined"?CATALOG:[]); }

/* ---- CART ---- */
const CART_KEY = 'gp_cart';
function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY))||[]; }catch(e){ return []; } }
function saveCart(c){ localStorage.setItem(CART_KEY,JSON.stringify(c)); }
function cartCount(){ return getCart().reduce((s,c)=>s+c.qty,0); }
function addToCart(id,qty=1){
  const c=getCart(); const ex=c.find(x=>x.id===id);
  if(ex) ex.qty+=qty; else c.push({id,qty});
  saveCart(c); refreshCartUI(); pulseCart();
  const p=getProducts().find(x=>x.id===id);
  if(p) toast('Ajouté au panier : '+p.name,'🛒');
}
function setQty(id,q){
  let c=getCart();
  if(q<=0) c=c.filter(x=>x.id!==id); else { const ex=c.find(x=>x.id===id); if(ex) ex.qty=q; }
  saveCart(c); refreshCartUI();
}
function subtotalN(){ return getCart().reduce((s,c)=>{ const p=getProducts().find(x=>x.id===c.id); return s+(p?p.priceN*c.qty:0); },0); }
function discountN(p){ return p ? Math.round(subtotalN()*0.1) : 0; }

/* ---- WISHLIST ---- */
const WISH_KEY = 'gp_wish';
function getWish(){ try{ return JSON.parse(localStorage.getItem(WISH_KEY))||[]; }catch(e){ return []; } }
function toggleWish(id){
  let w=getWish();
  const adding=!w.includes(id);
  w=adding?[...w,id]:w.filter(x=>x!==id);
  localStorage.setItem(WISH_KEY,JSON.stringify(w));
  document.querySelectorAll('.wish-btn[data-id="'+id+'"]').forEach(b=>{ b.classList.toggle('active',adding); b.innerHTML=heartSVG(adding); if(adding){b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');} });
  toast(adding?'Ajouté aux favoris ❤':'Retiré des favoris');
}
function isWished(id){ return getWish().includes(id); }

/* ---- RECENTLY VIEWED ---- */
const RECENT_KEY = 'gp_recent';
function getRecent(){ try{ return JSON.parse(localStorage.getItem(RECENT_KEY))||[]; }catch(e){ return []; } }
function pushRecent(id){
  let r=getRecent().filter(x=>x!==id);
  r.unshift(id);
  localStorage.setItem(RECENT_KEY,JSON.stringify(r.slice(0,8)));
}

/* ---- CART UI ---- */
function openCart(){ document.getElementById('gp-cart').classList.add('open'); document.getElementById('gp-overlay').classList.add('open'); renderCartDrawer(); }
function closeCart(){ document.getElementById('gp-cart').classList.remove('open'); document.getElementById('gp-overlay').classList.remove('open'); }
function refreshCartUI(){ updateCartBadge(); renderCartDrawer(); }
function updateCartBadge(){
  const n=cartCount();
  document.querySelectorAll('.gp-cart-badge').forEach(b=>{ b.textContent=n; b.style.display=n>0?'flex':'none'; });
}
function pulseCart(){
  document.querySelectorAll('.gp-cart-btn').forEach(b=>{ b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
}

function renderCartDrawer(){
  const cart=getCart();
  const promoApplied=window._promoApplied||false;
  const body=document.getElementById('gp-cart-body');
  const foot=document.getElementById('gp-cart-foot');
  if(!body||!foot) return;
  if(cart.length===0){
    body.innerHTML=`<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:40px;text-align:center"><div style="font-size:40px;opacity:.4">🛒</div><p style="font:400 15px Inter;color:var(--text2)">Votre panier est vide.</p><button onclick="closeCart()" class="btn-primary" style="font-size:14px;padding:13px 20px">Continuer mes achats</button></div>`;
    foot.innerHTML=''; return;
  }
  body.innerHTML=cart.map(c=>{
    const p=getProducts().find(x=>x.id===c.id); if(!p) return '';
    const dec=c.qty-1, inc=c.qty+1;
    return `<div class="cart-line reveal-item">
      <div class="cart-line-img ph" style="font:400 9px ui-monospace,monospace;color:var(--text2)">${p.model} 3D</div>
      <div style="flex:1;min-width:0">
        <div style="font:400 11px ui-monospace,monospace;color:var(--text2)">${p.brand}</div>
        <div style="font:600 13.5px/1.3 Inter;color:var(--text)">${p.name}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
          <div class="cart-qty">
            <button data-id="${c.id}" data-q="${dec}" class="cart-adj">−</button>
            <span>${c.qty}</span>
            <button data-id="${c.id}" data-q="${inc}" class="cart-adj">+</button>
          </div>
          <span class="clash" style="font:600 15px 'Clash Display',sans-serif">${fmt(p.priceN*c.qty)}</span>
        </div>
      </div>
      <button data-id="${c.id}" data-q="0" class="cart-adj cart-remove" style="align-self:flex-start;background:transparent;border:0;color:var(--text2);cursor:pointer;font:400 15px Inter">✕</button>
    </div>`;
  }).join('');
  document.querySelectorAll('.cart-adj').forEach(btn=>{
    btn.addEventListener('click',()=>setQty(btn.dataset.id,+btn.dataset.q));
  });
  const sub=subtotalN(), disc=discountN(promoApplied), total=sub-disc;
  foot.innerHTML=`
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <input id="promo-input" placeholder="Code promo" value="${window._promoCode||''}" class="form-input" style="flex:1">
      <button onclick="applyPromo()" class="btn-secondary" style="padding:11px 16px;font-size:13px">Appliquer</button>
    </div>
    ${window._promoMsg?'<div style="font:500 12.5px Inter;color:'+(promoApplied?'var(--accent2)':'var(--err)')+'">'+window._promoMsg+'</div>':''}
    <div style="display:flex;justify-content:space-between;font:400 14px Inter;color:var(--text2);margin:10px 0 6px"><span>Sous-total</span><span class="num">${fmt(sub)}</span></div>
    ${disc>0?'<div style="display:flex;justify-content:space-between;font:400 14px Inter;color:var(--accent2);margin-bottom:6px"><span>Remise (GEARPLAY10)</span><span class="num">−'+fmt(disc)+'</span></div>':''}
    <div style="display:flex;justify-content:space-between;font:400 14px Inter;color:var(--text2);margin-bottom:12px"><span>Livraison</span><span style="color:var(--accent2)">Offerte</span></div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px"><span style="font:600 15px Inter">Total</span><span class="clash num" style="font:600 24px 'Clash Display',sans-serif">${fmt(total)}</span></div>
    <a href="paiement.html" class="btn-primary" style="width:100%;display:flex;justify-content:center">Passer au paiement →</a>
  `;
}

function applyPromo(){
  const v=(document.getElementById('promo-input')||{value:''}).value.trim().toUpperCase();
  const ok=v==='GEARPLAY10';
  window._promoCode=v; window._promoApplied=ok; window._promoErr=!ok;
  window._promoMsg=ok?'Code GEARPLAY10 appliqué — -10 %':'Code invalide.';
  renderCartDrawer();
}

/* ---- TOAST ---- */
function toast(msg, icon){
  let host=document.getElementById('gp-toast');
  if(!host){ host=document.createElement('div'); host.id='gp-toast'; document.body.appendChild(host); }
  const t=document.createElement('div');
  t.className='gp-toast-item';
  t.innerHTML=(icon?'<span style="font-size:16px">'+icon+'</span>':'')+'<span>'+msg+'</span>';
  host.appendChild(t);
  setTimeout(()=>{ t.classList.add('out'); setTimeout(()=>t.remove(),300); }, 2600);
}

/* ---- LIVE SEARCH ---- */
function runLiveSearch(q){
  const box=document.getElementById('gp-search-results');
  if(!box) return;
  q=q.trim().toLowerCase();
  if(q===''){ box.classList.remove('open'); box.innerHTML=''; return; }
  const matches=getProducts().filter(p=>(p.name+' '+p.brand+' '+p.cat).toLowerCase().includes(q)).slice(0,5);
  if(matches.length===0){
    box.innerHTML='<div style="padding:16px;font:400 13px Inter;color:var(--text2)">Aucun résultat pour « '+q+' »</div>';
  } else {
    box.innerHTML=matches.map(p=>`<a href="produit.html?id=${p.id}" class="search-result"><span class="search-result-thumb ph">${p.model}</span><span style="flex:1;min-width:0"><span style="display:block;font:600 13px Inter;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</span><span style="display:block;font:400 11px ui-monospace,monospace;color:var(--text2)">${p.brand}</span></span><span class="clash num" style="font:600 14px 'Clash Display',sans-serif;color:var(--text)">${fmt(p.priceN)}</span></a>`).join('')
      + `<a href="categorie.html?q=${encodeURIComponent(q)}" class="search-result-all">Voir tous les résultats →</a>`;
  }
  box.classList.add('open');
}

/* ---- HEADER ---- */
function renderHeader(active){
  const themeIcon = getTheme()==='dark'?'☀':'☾';
  const badge='<span class="gp-cart-badge num" style="display:'+(cartCount()>0?'flex':'none')+'">'+cartCount()+'</span>';
  const cats=['Consoles','Manettes','Smartphones','PC portables','Tablettes','Photo'];
  const nav = cats.map(c=>'<a href="categorie.html?cat='+encodeURIComponent(c)+'"'+(active===c?' class="active"':'')+'>'+c+'</a>').join('');
  return '<div id="gp-topbar" class="promo-bar">Bienvenue chez Cortex Play — <strong>-10 %</strong> sur votre première commande avec le code <strong>GEARPLAY10</strong></div>'+
  '<div id="gp-header"><div class="gp-nav">'+
  '<a href="index.html" class="gp-logo"><span class="gp-logo-icon"><svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M7 8h10a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4c-1.4 0-2.2-.7-3-1.5S12.8 17 12 17s-1.2-1-2-1.5S8.4 16 7 16a4 4 0 0 1-4-4v0a4 4 0 0 1 4-4Z" stroke="var(--cta-fg)" stroke-width="1.7"/><circle cx="8" cy="12" r="1.3" fill="var(--cta-fg)"/><path d="M15.6 11.2v1.6M14.8 12h1.6" stroke="var(--cta-fg)" stroke-width="1.3" stroke-linecap="round"/></svg></span><span class="gp-logo-text clash">Cortex<span>Play</span></span></a>'+
  '<nav class="gp-navlinks">'+nav+'</nav>'+
  '<div class="gp-spacer"></div>'+
  '<div class="gp-search-wrap"><div class="gp-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="var(--text2)" stroke-width="1.8"/><path d="m20 20-3.5-3.5" stroke="var(--text2)" stroke-width="1.8" stroke-linecap="round"/></svg><input id="gp-search-input" placeholder="Rechercher un produit" autocomplete="off"/></div><div id="gp-search-results" class="search-results"></div></div>'+
  '<button class="gp-icon-btn" onclick="toggleTheme()" id="theme-toggle">'+themeIcon+'</button>'+
  '<a href="compte.html" class="gp-icon-btn" aria-label="Compte"><svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="1.7"/><path d="M5.5 19a6.5 6.5 0 0 1 13 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></a>'+
  '<button class="gp-icon-btn gp-cart-btn" onclick="openCart()" aria-label="Panier"><svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M6 7h13l-1.3 8.5a2 2 0 0 1-2 1.7H9.3a2 2 0 0 1-2-1.7L6 5H3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="20" r="1.3" fill="currentColor"/><circle cx="16" cy="20" r="1.3" fill="currentColor"/></svg>'+badge+'</button>'+
  '</div></div>';
}

/* ---- CART DRAWER HTML ---- */
function renderCartHTML(){
  return '<div id="gp-overlay" onclick="closeCart()"></div>'+
  '<aside id="gp-cart"><div class="cart-head"><h2 class="clash">Votre panier</h2><button onclick="closeCart()" style="width:34px;height:34px;border-radius:8px;border:1px solid var(--hair);background:transparent;color:var(--text);cursor:pointer;font:400 18px Inter">✕</button></div>'+
  '<div id="gp-cart-body" class="cart-body"></div>'+
  '<div id="gp-cart-foot" class="cart-foot"></div></aside>';
}

/* ---- FOOTER ---- */
function renderFooter(){
  const cols=[
    {h:'Boutique',links:[['Consoles','categorie.html?cat=Consoles'],['Smartphones','categorie.html?cat=Smartphones'],['PC portables','categorie.html?cat=PC%20portables'],['Tout le catalogue','categorie.html']]},
    {h:'Aide',links:[['Suivi de commande','suivi.html'],['Livraison','contact.html'],['Retours','contact.html'],['Contact','contact.html']]},
    {h:'Société',links:[['À propos','a-propos.html'],['Nos engagements','a-propos.html'],['Mon compte','compte.html'],['Espace admin','login.html']]},
  ];
  return '<footer id="gp-footer"><div class="footer-grid">'+
  '<div><a href="index.html" style="text-decoration:none"><span class="clash gp-logo-text">Cortex<span>Play</span></span></a><p style="font:400 13.5px/1.6 Inter;color:var(--text2);margin:12px 0 0;max-width:260px">Boutique française de high-tech et gaming neuf. Livraison 24-48h partout en France métropolitaine.</p>'+
  '<div style="display:flex;gap:8px;margin-top:16px">'+['IG','X','YT','TT'].map(s=>'<a href="#" class="social-btn">'+s+'</a>').join('')+'</div></div>'+
  cols.map(c=>'<div><div style="font:600 12px Inter;letter-spacing:.08em;text-transform:uppercase;color:var(--text2);margin-bottom:12px">'+c.h+'</div>'+c.links.map(l=>'<a href="'+l[1]+'" style="display:block;font:400 13.5px/1 Inter;color:var(--text);padding:6px 0" class="foot-link">'+l[0]+'</a>').join('')+'</div>').join('')+
  '</div><div class="footer-bottom"><div class="footer-bottom-inner"><span>© 2026 Cortex Play Store SAS · SIRET 902 456 781 00025 · TVA FR90 902456781</span><span style="display:flex;gap:16px"><a href="mentions-legales.html">Mentions légales</a><a href="cgv.html">CGV</a><a href="confidentialite.html">Confidentialité</a></span></div></div></footer>';
}

/* ---- PRODUCT CARD ---- */
function productCard(p, baseHref){
  baseHref = baseHref || 'produit.html';
  const w = isWished(p.id);
  const priceStr = fmt(p.priceN);
  const oldStr = fmt(p.oldN);
  const starsStr = stars(p.rating);
  const stockColor = p.inStock ? 'var(--ok)' : 'var(--err)';
  const stockLabel = p.inStock ? 'En stock' : 'Sur commande';
  const badgeHtml = p.off ? '<span class="badge" style="position:absolute;top:12px;left:12px">-' + p.off + '%</span>' : '';
  const oldHtml = p.off ? '<span class="card-old">' + oldStr + '</span>' : '';
  const link = baseHref + '?id=' + p.id;
  const div = document.createElement('div');
  div.className = 'product-card reveal';
  div.style.cssText = 'text-decoration:none;color:inherit';
  div.innerHTML = [
    '<a href="' + link + '" class="card-thumb ph" style="text-decoration:none">',
    badgeHtml,
    '<button class="wish-btn' + (w ? ' active' : '') + '" data-id="' + p.id + '" data-wish aria-label="Favori">',
    heartSVG(w),
    '</button>',
    '<span style="font:400 11px ui-monospace,monospace;color:var(--text2)">' + p.model + ' 3D</span>',
    '<span class="card-3d-hint">vue 3D</span>',
    '</a>',
    '<div class="card-body">',
    '<div style="display:flex;justify-content:space-between">',
    '<span class="card-brand">' + p.brand + '</span>',
    '<span style="font:500 12px Inter;color:' + stockColor + '">' + stockLabel + '</span>',
    '</div>',
    '<a href="' + link + '" class="card-name" style="text-decoration:none">' + p.name + '</a>',
    '<div class="card-stars">' + starsStr + ' <span style="color:var(--text2);font-size:12px;letter-spacing:0">' + p.rating + ' (' + p.reviews + ')</span></div>',
    '<div style="display:flex;align-items:baseline;gap:8px;margin-top:2px">',
    '<span class="card-price clash">' + priceStr + '</span>' + oldHtml,
    '</div>',
    '<div style="display:flex;gap:8px;margin-top:auto;padding-top:10px">',
    '<a href="' + link + '" class="btn-sm" style="flex:1;display:flex;align-items:center;justify-content:center;text-decoration:none">Voir en 3D</a>',
    '<button data-add="' + p.id + '" class="card-add-btn" aria-label="Ajouter au panier">+</button>',
    '</div></div>',
  ].join('');
  div.querySelector('[data-wish]').addEventListener('click', function(e){ e.preventDefault(); toggleWish(p.id); });
  div.querySelector('[data-add]').addEventListener('click', function(){ addToCart(p.id); const b=this; b.textContent='✓'; b.classList.add('added'); setTimeout(()=>{b.textContent='+';b.classList.remove('added');},1200); });
  return div;
}

function renderCards(products, containerId, baseHref){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = '';
  products.forEach((p,i) => { const c=productCard(p, baseHref); c.style.setProperty('--reveal-delay', (i*60)+'ms'); el.appendChild(c); });
  observeReveal();
}

/* ---- SCROLL REVEAL ---- */
let _revealObserver=null;
function observeReveal(){
  const els=document.querySelectorAll('.reveal:not(.in)');
  if(!('IntersectionObserver' in window)){ els.forEach(e=>e.classList.add('in')); return; }
  if(!_revealObserver){
    _revealObserver=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); _revealObserver.unobserve(e.target); } });
    },{threshold:0.05, rootMargin:'0px 0px -30px 0px'});
  }
  const vh=window.innerHeight||800;
  els.forEach(e=>{
    // Reveal immediately whatever is already in the initial viewport
    const r=e.getBoundingClientRect();
    if(r.top < vh*0.95){ e.classList.add('in'); }
    else { _revealObserver.observe(e); }
  });
  // Safety net: never leave content hidden
  setTimeout(()=>{ document.querySelectorAll('.reveal:not(.in)').forEach(e=>{ const r=e.getBoundingClientRect(); if(r.top < (window.innerHeight||800)) e.classList.add('in'); }); }, 400);
}

/* ---- INIT ---- */
function initPage(active){
  applyTheme(getTheme());
  const header=document.getElementById('gp-header-mount');
  if(header){ header.innerHTML=renderHeader(active); }
  const cartMount=document.getElementById('gp-cart-mount');
  if(cartMount){ cartMount.innerHTML=renderCartHTML(); renderCartDrawer(); }
  const footer=document.getElementById('gp-footer-mount');
  if(footer){ footer.innerHTML=renderFooter(); }
  // Live search
  const si=document.getElementById('gp-search-input');
  if(si){
    si.addEventListener('input',e=>runLiveSearch(e.target.value));
    si.addEventListener('keydown',e=>{ if(e.key==='Enter') window.location='categorie.html?q='+encodeURIComponent(si.value); });
    document.addEventListener('click',e=>{ if(!e.target.closest('.gp-search-wrap')){ const box=document.getElementById('gp-search-results'); if(box) box.classList.remove('open'); } });
  }
  observeReveal();
}
document.addEventListener('DOMContentLoaded', ()=>initPage(window.GP_ACTIVE_CAT||null));
