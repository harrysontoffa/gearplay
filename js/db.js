/* db.js — API backend + cache localStorage v3 */
const API_BASE    = 'http://localhost:3000/api';
const DB_KEY      = 'gp_products';
const ORDERS_KEY  = 'gp_orders';
const DB_VERSION  = 3;
const VER_KEY     = 'gp_db_version';

function dbMigrate(){
  const ver = +(localStorage.getItem(VER_KEY)||0);
  if(ver < DB_VERSION){
    try{
      const raw = localStorage.getItem(DB_KEY);
      if(raw){
        const products = JSON.parse(raw);
        const migrated = products.map(p=>({
          viewer:'canvas', embedUrl:null, imgSrc:null, stockN:0, inStock:true, off:0,
          colors:[{label:'Noir',hex:'#1c1f24'}], specs:[], ...p
        }));
        localStorage.setItem(DB_KEY, JSON.stringify(migrated));
      }
    }catch(e){}
    localStorage.setItem(VER_KEY, DB_VERSION);
  }
}

/* Chargement depuis l'API dès l'ouverture de la page */
(function syncFromAPI(){
  fetch(API_BASE + '/products')
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(products => {
      const normalized = products.map(p => ({...p, desc: p.description}));
      localStorage.setItem(DB_KEY, JSON.stringify(normalized));
      localStorage.setItem(VER_KEY, DB_VERSION);
      window.dispatchEvent(new Event('gp-db-changed'));
      console.log('[db] ' + normalized.length + ' produits chargés depuis l\'API');
    })
    .catch(err => console.warn('[db] API indisponible, cache local utilisé', err));
})();

function dbGet(){
  dbMigrate();
  try{
    const raw = localStorage.getItem(DB_KEY);
    if(raw){ const p=JSON.parse(raw); if(Array.isArray(p)&&p.length>0) return p; }
  }catch(e){}
  const seed = (typeof CATALOG!=='undefined') ? JSON.parse(JSON.stringify(CATALOG)) : [];
  localStorage.setItem(DB_KEY, JSON.stringify(seed));
  return seed;
}
function dbSave(products){
  localStorage.setItem(DB_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event('gp-db-changed'));
}
function dbGetProduct(id){ return dbGet().find(p=>p.id===id)||null; }
function dbValidate(p){
  const errors = [];
  if(!p.id||typeof p.id!=='string'||!/^[a-z0-9-]+$/.test(p.id)) errors.push("L'id doit être en minuscules, chiffres et tirets.");
  if(!p.name||p.name.trim().length<2) errors.push('Le nom doit faire au moins 2 caractères.');
  if(!p.brand||p.brand.trim().length<1) errors.push('La marque est obligatoire.');
  if(typeof p.priceN!=='number'||p.priceN<=0) errors.push('Le prix doit être supérieur à 0.');
  if(!Array.isArray(p.colors)||p.colors.length===0) errors.push('Au moins un coloris est requis.');
  return errors;
}
function dbUpsert(product){
  const errors = dbValidate(product);
  if(errors.length>0) return {ok:false, errors};
  const products = dbGet();
  const idx = products.findIndex(p=>p.id===product.id);
  if(idx>=0) products[idx]=product; else products.push(product);
  dbSave(products);
  return {ok:true};
}
function dbDelete(id){ dbSave(dbGet().filter(p=>p.id!==id)); }
function dbReset(){
  localStorage.removeItem(DB_KEY);
  localStorage.setItem(VER_KEY, DB_VERSION);
  return dbGet();
}
function dbDecrementStock(cartLines){
  const products = dbGet();
  cartLines.forEach(line=>{
    const p = products.find(x=>x.id===line.id);
    if(!p) return;
    p.stockN = Math.max(0, (p.stockN||0) - line.qty);
    if(p.stockN===0) p.inStock = false;
  });
  dbSave(products);
}
function dbGetOrders(){
  try{ return JSON.parse(localStorage.getItem(ORDERS_KEY))||[]; }catch(e){ return []; }
}
function dbSaveOrder(order){
  const orders = dbGetOrders();
  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}
function dbExport(){
  const data = { version: DB_VERSION, exportedAt: new Date().toISOString(), products: dbGet(), orders: dbGetOrders() };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gearplay-db-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
}
function dbImport(file, onDone){
  const reader = new FileReader();
  reader.onload = e=>{
    try{
      const data = JSON.parse(e.target.result);
      if(!Array.isArray(data.products)) throw new Error('Format invalide');
      localStorage.setItem(DB_KEY, JSON.stringify(data.products));
      if(Array.isArray(data.orders)) localStorage.setItem(ORDERS_KEY, JSON.stringify(data.orders));
      localStorage.setItem(VER_KEY, DB_VERSION);
      if(onDone) onDone({ok:true, count:data.products.length});
    }catch(err){
      if(onDone) onDone({ok:false, error:err.message});
    }
  };
  reader.readAsText(file);
}