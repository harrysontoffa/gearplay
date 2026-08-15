
/* three-viewer.js — 3D product viewer using Three.js */
let _viewer = null;

function initViewer(canvasId, modelType, colorHex){
  const canvas = document.getElementById(canvasId);
  if(!canvas) return;
  const fallback = document.getElementById('viewer-fallback');

  if(typeof THREE === 'undefined'){
    if(fallback) fallback.style.display='flex'; return;
  }

  if(_viewer){ _viewer.stop(); _viewer=null; }

  let renderer;
  try{ renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true}); }
  catch(e){ if(fallback) fallback.style.display='flex'; return; }

  const w=canvas.clientWidth||500, h=canvas.clientHeight||500;
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(w,h,false);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(40, w/h, 0.1, 100);
  const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--cta-bg').trim();
  const accentCol = new THREE.Color(accentHex||'#c6f551');

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(4,6,5); scene.add(key);
  const rim = new THREE.PointLight(accentCol, 1.5, 40); rim.position.set(-5,2,-3); scene.add(rim);

  const fill = new THREE.DirectionalLight(0x88aaff, 0.4); fill.position.set(-3,-2,4); scene.add(fill);

  const built = buildModel(THREE, modelType, colorHex, accentCol);
  const root = new THREE.Group(); root.add(built.group); scene.add(root);
  let dist = built.dist||6.6;
  cam.position.set(0,0.3,dist);

  let rx=0.15, ry=0, tRx=0.15, tRy=0;
  let dragging=false, px=0, py=0, lastIdle=performance.now(), alive=true;

  const down=e=>{ dragging=true; canvas.style.cursor='grabbing'; const p=e.touches?e.touches[0]:e; px=p.clientX; py=p.clientY; };
  const move=e=>{ if(!dragging)return; const p=e.touches?e.touches[0]:e; tRy+=(p.clientX-px)*0.01; tRx+=(p.clientY-py)*0.008; tRx=Math.max(-0.9,Math.min(0.9,tRx)); px=p.clientX; py=p.clientY; lastIdle=performance.now(); };
  const up=()=>{ dragging=false; canvas.style.cursor='grab'; lastIdle=performance.now(); };
  canvas.addEventListener('mousedown',down); window.addEventListener('mousemove',move); window.addEventListener('mouseup',up);
  canvas.addEventListener('touchstart',down,{passive:true}); canvas.addEventListener('touchmove',move,{passive:true}); canvas.addEventListener('touchend',up);
  canvas.addEventListener('wheel',e=>{ e.preventDefault(); dist=Math.max(4,Math.min(11,dist+e.deltaY*0.01)); },{passive:false});
  window.addEventListener('resize',()=>{ const nw=canvas.clientWidth,nh=canvas.clientHeight; renderer.setSize(nw,nh,false); cam.aspect=nw/nh; cam.updateProjectionMatrix(); });

  const loop=()=>{
    if(!alive){ renderer.dispose(); return; }
    const idle=performance.now()-lastIdle>900;
    if(idle&&!dragging) tRy+=0.004;
    rx+=(tRx-rx)*0.1; ry+=(tRy-ry)*0.1;
    root.rotation.x=rx; root.rotation.y=ry;
    cam.position.z+=(dist-cam.position.z)*0.1;
    renderer.render(scene,cam);
    requestAnimationFrame(loop);
  };
  loop();

  _viewer = { stop:()=>{alive=false;}, tints:built.tints };
  return _viewer;
}

function applyViewerColor(hex){
  if(_viewer&&_viewer.tints) _viewer.tints.forEach(m=>m.color.set(hex));
}

function mat(T,hex,metal,rough){ return new T.MeshStandardMaterial({color:new T.Color(hex),metalness:metal,roughness:rough}); }

function buildModel(T, type, bodyHex, accent){
  const g=new T.Group();
  const C=48;
  const body=mat(T,bodyHex,0.35,0.5);
  const dark=mat(T,'#0e1013',0.5,0.3);
  const glass=new T.MeshStandardMaterial({color:0x0a0c10,metalness:0.4,roughness:0.12,emissive:0x11202e,emissiveIntensity:0.4});
  const accMat=new T.MeshStandardMaterial({color:accent,metalness:0.2,roughness:0.35,emissive:accent,emissiveIntensity:0.12});
  const tints=[body];

  if(type==='console'){
    const tower=new T.Mesh(new T.BoxGeometry(1.25,2.7,0.6),body); tower.position.y=0.35; g.add(tower);
    const base=new T.Mesh(new T.CylinderGeometry(0.55,0.62,0.14,C),dark); base.position.y=-1.05; g.add(base);
    const led=new T.Mesh(new T.BoxGeometry(0.06,2.3,0.02),new T.MeshStandardMaterial({color:accent,emissive:accent,emissiveIntensity:0.7})); led.position.set(0.66,0.35,0.02); g.add(led);
    for(let i=0;i<7;i++){ const v=new T.Mesh(new T.BoxGeometry(0.9,0.02,0.02),dark); v.position.set(0,1.4-i*0.12,0.31); g.add(v); }
    g.rotation.x=0.12; return {group:g,dist:7.2,tints};
  }
  if(type==='laptop'){
    const base2=new T.Mesh(new T.BoxGeometry(2.7,0.14,1.8),body); base2.position.y=-0.5; g.add(base2);
    const deck=new T.Mesh(new T.BoxGeometry(2.4,0.02,1.2),dark); deck.position.set(0,-0.42,0.15); g.add(deck);
    const lidPivot=new T.Group(); lidPivot.position.set(0,-0.57,-0.9);
    const panel=new T.Mesh(new T.BoxGeometry(2.7,1.7,0.09),body); panel.position.set(0,0.85,0); lidPivot.add(panel); tints.push(panel.material);
    const scr=new T.Mesh(new T.BoxGeometry(2.5,1.5,0.02),glass); scr.position.set(0,0.85,0.06); lidPivot.add(scr);
    lidPivot.rotation.x=-1.15; g.add(lidPivot);
    const strip=new T.Mesh(new T.BoxGeometry(2.7,0.03,0.03),accMat); strip.position.set(0,-0.43,-0.88); g.add(strip);
    return {group:g,dist:6.8,tints};
  }
  if(type==='camera'){
    const bodyM=new T.Mesh(new T.BoxGeometry(1.9,1.25,0.6),body); g.add(bodyM);
    const grip=new T.Mesh(new T.BoxGeometry(0.4,1.25,0.7),body); grip.position.set(-0.85,0,0.05); g.add(grip);
    const lens=new T.Mesh(new T.CylinderGeometry(0.44,0.5,0.75,C),mat(T,'#15171b',0.6,0.25)); lens.rotation.x=Math.PI/2; lens.position.set(0.15,-0.05,0.78); g.add(lens);
    const ring=new T.Mesh(new T.TorusGeometry(0.44,0.04,16,C),accMat); ring.position.set(0.15,-0.05,1.14); g.add(ring);
    g.rotation.x=0.15; return {group:g,dist:6.2,tints};
  }
  if(type==='phone'){
    const frame=new T.Mesh(new T.BoxGeometry(1.35,2.75,0.16),body); g.add(frame);
    const screen=new T.Mesh(new T.BoxGeometry(1.2,2.55,0.02),glass); screen.position.z=0.09; g.add(screen);
    [[-0.35,0.9],[0.0,0.9],[-0.35,0.55]].forEach(([x,y])=>{
      const lens=new T.Mesh(new T.CylinderGeometry(0.14,0.14,0.1,C),dark); lens.rotation.x=Math.PI/2; lens.position.set(x-0.25,y,-0.12); g.add(lens);
      const r=new T.Mesh(new T.TorusGeometry(0.14,0.02,16,C),accMat); r.position.set(x-0.25,y,-0.16); g.add(r);
    });
    g.rotation.x=0.15; return {group:g,dist:6.6,tints};
  }
  // controller
  const hull=new T.Mesh(new T.CylinderGeometry(0.9,1.05,0.55,C,1,false,0,Math.PI),body); hull.rotation.x=Math.PI; hull.position.y=0.05; g.add(hull);
  const top=new T.Mesh(new T.SphereGeometry(0.9,C,C,0,Math.PI*2,0,Math.PI/2.2),body); top.position.y=0.05; g.add(top);
  const grL=new T.Mesh(new T.CylinderGeometry(0.28,0.34,0.8,C),body); grL.position.set(-0.42,-0.45,0.1); g.add(grL);
  const grR=new T.Mesh(new T.CylinderGeometry(0.28,0.34,0.8,C),body); grR.position.set(0.42,-0.45,0.1); g.add(grR);
  const led2=new T.Mesh(new T.TorusGeometry(0.18,0.03,16,C),accMat); led2.rotation.x=Math.PI/2; led2.position.set(0,0.2,0.86); g.add(led2);
  g.rotation.x=0.15;
  return {group:g, dist:6.2, tints};
}
