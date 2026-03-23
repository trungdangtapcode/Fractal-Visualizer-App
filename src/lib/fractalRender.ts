export const PAL=[[9,1,47],[4,4,73],[0,7,100],[12,44,138],[24,82,177],[57,125,209],[134,181,229],[211,236,248],[241,233,191],[248,201,95],[255,170,0],[204,128,0],[153,87,0],[106,52,3],[66,30,15],[25,7,26]];

export function lerp3(a: number[], b: number[], t: number) {
  return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
}

export function iterToRGB(t: number, mx: number) {
  if(t < 0) return [0,0,0];
  const n = PAL.length, s = (t/mx)*n*4, i = Math.floor(s)%n, f = s-Math.floor(s);
  const col = lerp3(PAL[i%n], PAL[(i+1)%n], f);
  return [Math.round(col[0]), Math.round(col[1]), Math.round(col[2])];
}

export function iterate(zx: number, zy: number, cx: number, cy: number, mx: number) {
  for(let i=0; i<mx; i++){
    const zx2 = zx*zx - zy*zy + cx;
    const zy2 = 2*zx*zy + cy;
    zx = zx2; zy = zy2;
    const m2 = zx*zx + zy*zy;
    if(m2 > 256) {
      return i + 1 - Math.log(Math.log(m2)/2/Math.LN2)/Math.LN2;
    }
  }
  return -1;
}

export function iterOrbit(zx: number, zy: number, cx: number, cy: number, mx: number) {
  const pts = [{x: zx, y: zy}];
  for(let i=0; i<mx; i++){
    const zx2 = zx*zx - zy*zy + cx;
    const zy2 = 2*zx*zy + cy;
    zx = zx2; zy = zy2;
    pts.push({x: zx, y: zy});
    if(zx*zx + zy*zy > 256) break;
  }
  return pts;
}

export const RS = 480;
export const MVIEW = {x: -2.5, y: -1.25, w: 3.5, h: 2.5};
export const JVIEW = {x: -2.0, y: -1.5, w: 4.0, h: 3.0};
export const PVIEW = {x: -2.5, y: -1.25, w: 3.5, h: 2.5};
export const OVIEW = {x: -2.2, y: -2.2, w: 4.4, h: 4.4};

export function renderFractal(canvas: HTMLCanvasElement | null, view: any, z0x: number, z0y: number, cx: number, cy: number, mx: number, isJulia: boolean) {
  if (!canvas) return;
  canvas.width = RS; canvas.height = RS;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = ctx.createImageData(RS, RS);
  const d = img.data;
  for(let py=0; py<RS; py++){
    const im = view.y + (py/RS)*view.h;
    for(let px=0; px<RS; px++){
      const re = view.x + (px/RS)*view.w;
      const t = isJulia ? iterate(re, im, cx, cy, mx) : iterate(z0x, z0y, re, im, mx);
      const [r, g, b] = iterToRGB(t, mx);
      const idx = (py*RS + px)*4;
      d[idx] = r; d[idx+1] = g; d[idx+2] = b; d[idx+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function renderOrbit(canvas: HTMLCanvasElement | null, z0x: number, z0y: number, cx: number, cy: number) {
  if (!canvas) return;
  canvas.width = RS; canvas.height = RS;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0,0,RS,RS);
  const ax = (0-OVIEW.x)/OVIEW.w*RS, ay = (0-OVIEW.y)/OVIEW.h*RS;

  ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(ax,0); ctx.lineTo(ax,RS); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,ay); ctx.lineTo(RS,ay); ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.setLineDash([3,4]);
  ctx.beginPath(); ctx.arc(ax,ay,2/OVIEW.w*RS,0,Math.PI*2); ctx.stroke();
  ctx.setLineDash([]);

  const pts = iterOrbit(z0x, z0y, cx, cy, 80);
  const escaped = pts[pts.length-1].x**2 + pts[pts.length-1].y**2 > 4;
  const N = pts.length;
  function ts(p: {x:number, y:number}) { return [(p.x-OVIEW.x)/OVIEW.w*RS, (p.y-OVIEW.y)/OVIEW.h*RS]; }

  for(let i=0; i<N-1; i++){
    const [x1, y1] = ts(pts[i]), [x2, y2] = ts(pts[i+1]);
    const a = Math.max(.1, .7*(1-i/N));
    ctx.strokeStyle = escaped ? `rgba(255,51,153,${a})` : `rgba(0,229,255,${a})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  }

  for(let i=0; i<Math.min(N,60); i++){
    const [sx, sy] = ts(pts[i]);
    const r = i===0 ? 6 : i===N-1 && escaped ? 5 : 3;
    let col = i===0 ? '#ffd60a' : escaped ? `rgba(255,100,180,${.9-i/N*.6})` : `rgba(0,229,255,${.9-i/N*.6})`;
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI*2);
    ctx.fillStyle = col; ctx.fill();
    if(i===0){ ctx.strokeStyle='#000'; ctx.lineWidth=1.5; ctx.stroke(); }
    if(i===N-1 && escaped){ ctx.strokeStyle='rgba(255,51,153,.8)'; ctx.lineWidth=1; ctx.stroke(); }
  }

  const [s0x, s0y] = ts(pts[0]);
  ctx.fillStyle = 'rgba(255,214,10,.9)'; ctx.font = '9px JetBrains Mono';
  ctx.fillText('z₀', s0x+7, s0y-5);

  ctx.font = '9px JetBrains Mono';
  ctx.fillStyle = escaped ? 'rgba(255,80,150,.8)' : 'rgba(0,229,255,.8)';
  ctx.fillText(escaped ? `→ escape sau ${N-1} bước` : `→ bounded ≥ ${N-1} bước`, 8, RS-8);
}

export function drawCursor(ov: HTMLCanvasElement | null, rx: number, ry: number, col='#ffd60a', state: 'normal'|'hover'|'drag' = 'normal') {
  if (!ov) return;
  ov.width = RS; ov.height = RS;
  const ctx = ov.getContext('2d');
  if(!ctx) return;
  ctx.clearRect(0,0,RS,RS);
  const px = rx*RS, py = ry*RS;
  ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,RS); ctx.moveTo(0,py); ctx.lineTo(RS,py); ctx.stroke();
  ctx.setLineDash([]);
  
  let glowRadius = 18;
  let coreRadius = 5;
  if (state === 'hover') { glowRadius = 24; coreRadius = 7; }
  if (state === 'drag') { glowRadius = 14; coreRadius = 4; }

  const g = ctx.createRadialGradient(px,py,0,px,py,glowRadius);
  g.addColorStop(0,col+(state === 'hover' ? '88' : '55')); g.addColorStop(1,col+'00');
  ctx.beginPath(); ctx.arc(px,py,glowRadius,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
  ctx.beginPath(); ctx.arc(px,py,coreRadius,0,Math.PI*2);
  ctx.fillStyle=col; ctx.fill(); ctx.strokeStyle='#000'; ctx.lineWidth=1.5; ctx.stroke();
  
  if (state === 'hover' || state === 'drag') {
    ctx.beginPath(); ctx.arc(px,py,glowRadius + 2,0,Math.PI*2);
    ctx.strokeStyle = col + 'cc'; 
    ctx.lineWidth = state === 'hover' ? 1.5 : 2; 
    if (state === 'drag') ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

export function clearOv(c: HTMLCanvasElement | null) {
  if(c && c.width) c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
}

export function markPoint(ov: HTMLCanvasElement | null, view: any, re: number, im: number, col: string) {
  const rx = (re-view.x)/view.w, ry = (im-view.y)/view.h;
  if(rx<0 || rx>1 || ry<0 || ry>1) return;
  drawCursor(ov, rx, ry, col, 'normal');
}

export function fmt(re: number, im: number){
  const s = im>=0 ? '+' : '−';
  return `${re.toFixed(5)} ${s} ${Math.abs(im).toFixed(5)}i`;
}

export function inMand(re: number, im: number){
  const q = (re-.25)*(re-.25) + im*im;
  if(q*(q+(re-.25)) < .25*im*im) return true;
  if((re+1)*(re+1) + im*im < .0625) return true;
  return iterate(0,0,re,im,300) < 0;
}

export function inJulia(re: number, im: number, cx: number, cy: number){
  return iterate(re,im,cx,cy,300) < 0;
}