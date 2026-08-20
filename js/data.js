
const CATALOG = [
  {
    id:'ctrl-edge', brand:'Cortex Play', cat:'Manettes', model:'controller',
    name:'Manette Pro sans fil Edge', priceN:179, oldN:219, off:18,
    rating:4.9, reviews:1240, inStock:true, stockN:42,
    desc:"Manette haut de gamme à faible latence : gâchettes à course réglable, palettes arrière programmables et autonomie de 40 heures. Personnalisez le coloris et visualisez-le en temps réel.",
    colors:[{label:'Noir carbone',hex:'#22262d'},{label:'Blanc arctique',hex:'#e7e9ee'},{label:'Vert lime',hex:'#a9d94a'},{label:'Bleu nuit',hex:'#2a3a5e'}],
    specs:[['Connectivité','Sans fil 2.4G + BT'],['Latence','1 ms'],['Autonomie','40 h'],['Palettes arrière','4 programmables'],['Gâchettes','Course réglable'],['Retour haptique','Oui'],['Poids','268 g'],['Compatibilité','PC · console · mobile']],
    thumb:'img/manette.jpg', viewer:'canvas', embedUrl:null, imgSrc:null
  },
  {
    id:'console-x', brand:'Nova', cat:'Consoles', model:'console',
    name:'Console Nova X — neuve', priceN:499, oldN:549, off:9,
    rating:4.8, reviews:2130, inStock:true, stockN:18,
    desc:"Console de salon nouvelle génération : SSD ultra-rapide, ray tracing matériel et sortie 4K 120 Hz. Livrée neuve, scellée d'usine, avec 2 ans de garantie.",
    colors:[{label:'Noir onyx',hex:'#181b20'},{label:'Blanc glacier',hex:'#e7e9ee'}],
    specs:[['Stockage','1 To SSD NVMe'],['Résolution','4K 120 Hz'],['Ray tracing','Matériel'],['RAM','16 Go GDDR6'],['Sortie','HDMI 2.1'],['Audio','3D spatial'],['Lecteur','Ultra HD Blu-ray'],['Garantie','2 ans']],
    thumb:'img/console.jpg', viewer:'canvas', embedUrl:null, imgSrc:null
  },
  {
    id:'phone-pro', brand:'Lumen', cat:'Smartphones', model:'phone',
    name:'Smartphone Lumen Pro 256 Go', priceN:1099, oldN:1199, off:8,
    rating:4.7, reviews:980, inStock:true, stockN:27,
    desc:"Smartphone flagship : écran OLED 120 Hz, triple capteur photo 50 Mpx et puce gravée en 3 nm. Changez de finition et faites-la pivoter sous tous les angles.",
    colors:[{label:'Graphite',hex:'#2b2e33'},{label:'Argent',hex:'#cfd3d9'},{label:'Or sable',hex:'#c9a86a'},{label:'Bleu océan',hex:'#2c4a63'}],
    specs:[['Écran','6,7" OLED 120 Hz'],['Stockage','256 Go'],['Photo','50 + 12 + 12 Mpx'],['Puce','3 nm octa-core'],['Batterie','5000 mAh'],['Charge','Filaire 65 W · sans fil'],['Étanchéité','IP68'],['5G','Oui']],
    thumb:'img/phone.jpg', viewer:'canvas', embedUrl:null, imgSrc:null
  },
  {
    id:'laptop-16', brand:'Strix', cat:'PC portables', model:'laptop',
    name:'PC portable gaming Strix 16"', priceN:1449, oldN:1699, off:15,
    rating:4.8, reviews:640, inStock:true, stockN:11,
    desc:'Ordinateur portable gaming 16″ : dalle 240 Hz, GPU dédié et refroidissement vapor chamber. Châssis aluminium usiné, clavier rétroéclairé par touche.',
    colors:[{label:'Noir eclipse',hex:'#1c1f24'},{label:'Gris sidéral',hex:'#3b4048'}],
    specs:[['Écran','16" QHD 240 Hz'],['Processeur','8 cœurs'],['GPU','12 Go dédié'],['RAM','32 Go DDR5'],['Stockage','1 To SSD'],['Clavier','RGB par touche'],['Poids','2,3 kg'],['Ports','2×USB-C · HDMI 2.1']],
    thumb:'img/laptop.jpg', viewer:'canvas', embedUrl:null, imgSrc:null
  },
  {
    id:'s22-ultra', brand:'Samsung', cat:'Smartphones', model:'phone',
    name:'Samsung Galaxy S22 Ultra', priceN:949, oldN:1259, off:25,
    rating:4.8, reviews:3860, inStock:true, stockN:34,
    desc:"Le flagship Samsung avec S Pen intégré : écran Dynamic AMOLED 2X 120 Hz, quadruple capteur photo jusqu'à 108 Mpx et puce Snapdragon 8 Gen 1. Modèle neuf, débloqué tout opérateur.",
    colors:[{label:'Noir Phantom',hex:'#1c1d21'},{label:'Bordeaux Burgundy',hex:'#5a2436'},{label:'Blanc Phantom',hex:'#e8e6e2'},{label:'Vert Green',hex:'#3c4a3f'}],
    specs:[['Écran','6,8" Dynamic AMOLED 2X 120 Hz'],['Stockage','256 Go'],['Photo','108 + 12 + 10 + 10 Mpx'],['Puce','Snapdragon 8 Gen 1'],['RAM','12 Go'],['Batterie','5000 mAh'],['S Pen','Intégré'],['Étanchéité','IP68']],
    thumb:'img/samsung.jpg', viewer:'embed', embedUrl:'https://sketchfab.com/models/a95eec5181a24bcd8a8452df50b29f3a/embed', imgSrc:null
  },
  {
    id:'cam-hybrid', brand:'Optik', cat:'Photo', model:'camera',
    name:'Appareil photo hybride Optik A7', priceN:1299, oldN:1399, off:7,
    rating:4.9, reviews:410, inStock:false, stockN:0,
    desc:"Hybride plein format : capteur 33 Mpx stabilisé, rafale 10 i/s et vidéo 4K 60p. Ergonomie soignée, viseur électronique haute définition.",
    colors:[{label:'Noir',hex:'#1c1f24'},{label:'Argent',hex:'#c8ccd3'}],
    specs:[['Capteur','Plein format 33 Mpx'],['Stabilisation','5 axes'],['Rafale','10 i/s'],['Vidéo','4K 60p'],['ISO','100 – 51200'],['Viseur','OLED 3,7 Mpts'],['Écran','Orientable tactile'],['Autonomie','610 vues']],
    thumb:'img/camera.jpg', viewer:'canvas', embedUrl:null, imgSrc:null
  }
];
