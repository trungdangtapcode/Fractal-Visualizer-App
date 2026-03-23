import React, { useEffect, useRef, useState } from 'react';
import './fractal.css';
import {
  MVIEW, JVIEW, PVIEW,
  iterate, renderFractal, renderOrbit,
  drawCursor, markPoint, fmt, inMand, inJulia
} from './lib/fractalRender';

export default function App() {
  const mCanvas = useRef<HTMLCanvasElement>(null);
  const mOver = useRef<HTMLCanvasElement>(null);
  const jCanvas = useRef<HTMLCanvasElement>(null);
  const jOver = useRef<HTMLCanvasElement>(null);
  const pCanvas = useRef<HTMLCanvasElement>(null);
  const pOver = useRef<HTMLCanvasElement>(null);
  const oCanvas = useRef<HTMLCanvasElement>(null);

  const [cVal, setCVal] = useState({ cx: -0.7269, cy: 0.1889 });
  const [zVal, setZVal] = useState({ z0x: 0, z0y: 0 });

  const [mChipTxt, setMChipTxt] = useState('max iter: 200');
  const [jChipTxt, setJChipTxt] = useState('—');
  const [pChipTxt, setPChipTxt] = useState('—');
  const [oChipTxt, setOChipTxt] = useState('—');

  const [mLoading, setMLoading] = useState(true);
  const [jLoading, setJLoading] = useState(true);
  const [pLoading, setPLoading] = useState(true);
  const [oLoading, setOLoading] = useState(true);

  const s = useRef({
    cx: -0.7269, cy: 0.1889,
    z0x: 0, z0y: 0,
    dragC: false, dragZ: false,
    jQ: { p: false, cx: 0, cy: 0, t: null as any },
    pQ: { p: false, z0x: 0, z0y: 0, t: null as any }
  });

  const rel = (e: React.MouseEvent, w: HTMLElement) => {
    const r = w.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  };

  const updateCDisplay = (ncx: number, ncy: number) => {
    s.current.cx = ncx; s.current.cy = ncy;
    setCVal({ cx: ncx, cy: ncy });
  };

  const updateZDisplay = (nzx: number, nzy: number) => {
    s.current.z0x = nzx; s.current.z0y = nzy;
    setZVal({ z0x: nzx, z0y: nzy });
  };

  const scheduleOrbit = () => {
    requestAnimationFrame(() => {
      renderOrbit(oCanvas.current, s.current.z0x, s.current.z0y, s.current.cx, s.current.cy);
      setOLoading(false);
      setOChipTxt('c · z₀ active');
    });
  };

  const scheduleJulia = (ncx: number, ncy: number, hi: boolean) => {
    const q = s.current.jQ;
    q.cx = ncx; q.cy = ncy;
    if (q.p) return; q.p = true;

    requestAnimationFrame(() => {
      q.p = false;
      const mx = hi ? 200 : 60;
      renderFractal(jCanvas.current, JVIEW, 0, 0, q.cx, q.cy, mx, true);
      setJLoading(false);
      setJChipTxt(`c: ${fmt(q.cx, q.cy)}`);
      markPoint(jOver.current, JVIEW, s.current.z0x, s.current.z0y, '#ff8c00');
      
      if (!hi) {
        clearTimeout(q.t);
        q.t = setTimeout(() => scheduleJulia(q.cx, q.cy, true), 700);
      }
    });
  };

  const scheduleParamPlane = (nzx: number, nzy: number, hi: boolean) => {
    const q = s.current.pQ;
    q.z0x = nzx; q.z0y = nzy;
    if (q.p) return; q.p = true;

    requestAnimationFrame(() => {
      q.p = false;
      const mx = hi ? 200 : 60;
      renderFractal(pCanvas.current, PVIEW, q.z0x, q.z0y, 0, 0, mx, false);
      setPLoading(false);
      const isZero = Math.abs(q.z0x) < .001 && Math.abs(q.z0y) < .001;
      setPChipTxt(isZero ? 'z₀=0 → giống Mandelbrot!' : 'z₀: ' + fmt(q.z0x, q.z0y));
      markPoint(pOver.current, PVIEW, s.current.cx, s.current.cy, '#00e5ff');
      
      if (!hi) {
        clearTimeout(q.t);
        q.t = setTimeout(() => scheduleParamPlane(q.z0x, q.z0y, true), 700);
      }
    });
  };

  const setCAndSync = (ncx: number, ncy: number) => {
    updateCDisplay(ncx, ncy);
    const prx = (ncx - MVIEW.x) / MVIEW.w;
    const pry = (ncy - MVIEW.y) / MVIEW.h;
    drawCursor(mOver.current, prx, pry, '#00e5ff', 'normal');
    markPoint(pOver.current, PVIEW, ncx, ncy, '#00e5ff');
    scheduleJulia(ncx, ncy, true);
    scheduleOrbit();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      renderFractal(mCanvas.current, MVIEW, 0, 0, 0, 0, 200, false);
      setMLoading(false);
      setMChipTxt('max iter: 200');

      renderFractal(pCanvas.current, PVIEW, 0, 0, 0, 0, 200, false);
      setPLoading(false);

      updateZDisplay(0, 0);
      setCAndSync(-0.7269, 0.1889);
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, []);

  // ======== ① MANDELBROT DRAG EVENTS ========
  const mWrapDown = (e: React.MouseEvent) => {
    s.current.dragC = true;
    (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
    const [rx, ry] = rel(e, e.currentTarget as HTMLElement);
    const ncx = MVIEW.x + rx * MVIEW.w, ncy = MVIEW.y + ry * MVIEW.h;
    updateCDisplay(ncx, ncy);
    drawCursor(mOver.current, rx, ry, '#00e5ff', 'drag');
    markPoint(pOver.current, PVIEW, ncx, ncy, '#00e5ff');
    scheduleJulia(ncx, ncy, false);
    scheduleOrbit();
  };

  const mWrapMove = (e: React.MouseEvent) => {
    const [rx, ry] = rel(e, e.currentTarget as HTMLElement);
    const prx = (s.current.cx - MVIEW.x) / MVIEW.w;
    const pry = (s.current.cy - MVIEW.y) / MVIEW.h;
    
    // Check if mouse is hovering near current target point
    const isNear = Math.hypot(rx - prx, ry - pry) < 0.05;

    if (s.current.dragC) {
      const ncx = MVIEW.x + rx * MVIEW.w, ncy = MVIEW.y + ry * MVIEW.h;
      updateCDisplay(ncx, ncy);
      markPoint(pOver.current, PVIEW, ncx, ncy, '#00e5ff');
      drawCursor(mOver.current, rx, ry, '#00e5ff', 'drag');
      scheduleJulia(ncx, ncy, false);
      scheduleOrbit();
    } else {
      // Free hover -> show effect if near
      drawCursor(mOver.current, prx, pry, '#00e5ff', isNear ? 'hover' : 'normal');
      (e.currentTarget as HTMLElement).style.cursor = isNear ? 'grab' : 'crosshair';
      if (isNear) {
        setMChipTxt(`Hovering c: ${fmt(s.current.cx, s.current.cy)}`);
      } else {
        const t = iterate(0, 0, MVIEW.x + rx * MVIEW.w, MVIEW.y + ry * MVIEW.h, 200);
        setMChipTxt(t < 0 ? '∈ Mandelbrot' : `iter ≈ ${Math.floor(t)}`);
      }
    }
  };

  const mWrapUp = (e: React.MouseEvent) => {
    if (s.current.dragC) {
      s.current.dragC = false;
      const [rx, ry] = rel(e, e.currentTarget as HTMLElement);
      drawCursor(mOver.current, rx, ry, '#00e5ff', 'hover');
      markPoint(pOver.current, PVIEW, s.current.cx, s.current.cy, '#00e5ff');
      (e.currentTarget as HTMLElement).style.cursor = 'grab';
      scheduleJulia(s.current.cx, s.current.cy, true);
    }
  };

  const mWrapLeave = (e: React.MouseEvent) => {
    if (s.current.dragC) {
      s.current.dragC = false;
      scheduleJulia(s.current.cx, s.current.cy, true);
    }
    const prx = (s.current.cx - MVIEW.x) / MVIEW.w;
    const pry = (s.current.cy - MVIEW.y) / MVIEW.h;
    drawCursor(mOver.current, prx, pry, '#00e5ff', 'normal');
    markPoint(pOver.current, PVIEW, s.current.cx, s.current.cy, '#00e5ff');
    (e.currentTarget as HTMLElement).style.cursor = 'crosshair';
    setMChipTxt('max iter: 200');
  };


  // ======== ② JULIA DRAG EVENTS ========
  const jWrapDown = (e: React.MouseEvent) => {
    s.current.dragZ = true;
    (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
    const [rx, ry] = rel(e, e.currentTarget as HTMLElement);
    const nzx = JVIEW.x + rx * JVIEW.w, nzy = JVIEW.y + ry * JVIEW.h;
    updateZDisplay(nzx, nzy);
    drawCursor(jOver.current, rx, ry, '#ff8c00', 'drag');
    scheduleParamPlane(nzx, nzy, false);
    scheduleOrbit();
  };

  const jWrapMove = (e: React.MouseEvent) => {
    const [rx, ry] = rel(e, e.currentTarget as HTMLElement);
    const prx = (s.current.z0x - JVIEW.x) / JVIEW.w;
    const pry = (s.current.z0y - JVIEW.y) / JVIEW.h;
    const isNear = Math.hypot(rx - prx, ry - pry) < 0.05;

    if (s.current.dragZ) {
      const nzx = JVIEW.x + rx * JVIEW.w, nzy = JVIEW.y + ry * JVIEW.h;
      updateZDisplay(nzx, nzy);
      drawCursor(jOver.current, rx, ry, '#ff8c00', 'drag');
      scheduleParamPlane(nzx, nzy, false);
      scheduleOrbit();
    } else {
      drawCursor(jOver.current, prx, pry, '#ff8c00', isNear ? 'hover' : 'normal');
      (e.currentTarget as HTMLElement).style.cursor = isNear ? 'grab' : 'crosshair';
      if (isNear) {
        setJChipTxt(`Hovering z₀: ${fmt(s.current.z0x, s.current.z0y)}`);
      } else {
        const t = iterate(JVIEW.x + rx * JVIEW.w, JVIEW.y + ry * JVIEW.h, s.current.cx, s.current.cy, 200);
        setJChipTxt(t < 0 ? '∈ Julia' : `iter ≈ ${Math.floor(t)}`);
      }
    }
  };

  const jWrapUp = (e: React.MouseEvent) => {
    if (s.current.dragZ) {
      s.current.dragZ = false;
      const [rx, ry] = rel(e, e.currentTarget as HTMLElement);
      drawCursor(jOver.current, rx, ry, '#ff8c00', 'hover');
      (e.currentTarget as HTMLElement).style.cursor = 'grab';
      scheduleParamPlane(s.current.z0x, s.current.z0y, true);
    }
  };

  const jWrapLeave = (e: React.MouseEvent) => {
    if (s.current.dragZ) {
      s.current.dragZ = false;
      scheduleParamPlane(s.current.z0x, s.current.z0y, true);
    }
    const prx = (s.current.z0x - JVIEW.x) / JVIEW.w;
    const pry = (s.current.z0y - JVIEW.y) / JVIEW.h;
    drawCursor(jOver.current, prx, pry, '#ff8c00', 'normal');
    (e.currentTarget as HTMLElement).style.cursor = 'crosshair';
    setJChipTxt(`c: ${fmt(s.current.cx, s.current.cy)}`);
  };


  // ======== ③ PARAMETER PLANE DRAG EVENTS (Mirror of ①) ========
  const pWrapDown = (e: React.MouseEvent) => {
    s.current.dragC = true; // Use the same dragC state since both planes edit `c`
    (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
    const [rx, ry] = rel(e, e.currentTarget as HTMLElement);
    const ncx = PVIEW.x + rx * PVIEW.w, ncy = PVIEW.y + ry * PVIEW.h;
    updateCDisplay(ncx, ncy);
    drawCursor(pOver.current, rx, ry, '#00e5ff', 'drag');
    markPoint(mOver.current, MVIEW, ncx, ncy, '#00e5ff');
    scheduleJulia(ncx, ncy, false);
    scheduleOrbit();
  };

  const pWrapMove = (e: React.MouseEvent) => {
    const [rx, ry] = rel(e, e.currentTarget as HTMLElement);
    const prx = (s.current.cx - PVIEW.x) / PVIEW.w;
    const pry = (s.current.cy - PVIEW.y) / PVIEW.h;
    const isNear = Math.hypot(rx - prx, ry - pry) < 0.05;

    if (s.current.dragC) {
      const ncx = PVIEW.x + rx * PVIEW.w, ncy = PVIEW.y + ry * PVIEW.h;
      updateCDisplay(ncx, ncy);
      drawCursor(pOver.current, rx, ry, '#00e5ff', 'drag');
      markPoint(mOver.current, MVIEW, ncx, ncy, '#00e5ff');
      scheduleJulia(ncx, ncy, false);
      scheduleOrbit();
    } else {
      drawCursor(pOver.current, prx, pry, '#00e5ff', isNear ? 'hover' : 'normal');
      (e.currentTarget as HTMLElement).style.cursor = isNear ? 'grab' : 'crosshair';
      if (isNear) {
        setPChipTxt(`Hovering c: ${fmt(s.current.cx, s.current.cy)}`);
      } else {
        const isZero = Math.abs(s.current.z0x) < .001 && Math.abs(s.current.z0y) < .001;
        setPChipTxt(isZero ? 'z₀=0 → giống Mandelbrot!' : 'z₀: ' + fmt(s.current.z0x, s.current.z0y));
      }
    }
  };

  const pWrapUp = (e: React.MouseEvent) => {
    if (s.current.dragC) {
      s.current.dragC = false;
      const [rx, ry] = rel(e, e.currentTarget as HTMLElement);
      drawCursor(pOver.current, rx, ry, '#00e5ff', 'hover');
      markPoint(mOver.current, MVIEW, s.current.cx, s.current.cy, '#00e5ff');
      (e.currentTarget as HTMLElement).style.cursor = 'grab';
      scheduleJulia(s.current.cx, s.current.cy, true);
    }
  };

  const pWrapLeave = (e: React.MouseEvent) => {
    if (s.current.dragC) {
      s.current.dragC = false;
      scheduleJulia(s.current.cx, s.current.cy, true);
    }
    const prx = (s.current.cx - PVIEW.x) / PVIEW.w;
    const pry = (s.current.cy - PVIEW.y) / PVIEW.h;
    drawCursor(pOver.current, prx, pry, '#00e5ff', 'normal');
    markPoint(mOver.current, MVIEW, s.current.cx, s.current.cy, '#00e5ff');
    (e.currentTarget as HTMLElement).style.cursor = 'crosshair';
    const isZero = Math.abs(s.current.z0x) < .001 && Math.abs(s.current.z0y) < .001;
    setPChipTxt(isZero ? 'z₀=0 → giống Mandelbrot!' : 'z₀: ' + fmt(s.current.z0x, s.current.z0y));
  };

  const inM = inMand(cVal.cx, cVal.cy);
  const inJJ = inJulia(zVal.z0x, zVal.z0y, cVal.cx, cVal.cy);

  return (
    <div className="fractal-root">
      
      <div className="fractal-sidebar">
        <header>
          <h1>Mandelbrot Explorer</h1>
          <div className="subtitle">Interactive Visualizer</div>
        </header>

        <div className="info-bars">
          <div className="info-bar">
            <span className="ib-label">c =</span>
            <span className="ib-val c">{fmt(cVal.cx, cVal.cy)}</span>
            <span className={`badge ${inM ? 'in' : 'out'}`}>{inM ? '∈ Mandelbrot' : '∉ Mandelbrot'}</span>
          </div>
          <div className="info-bar">
            <span className="ib-label">z₀ =</span>
            <span className="ib-val z">{fmt(zVal.z0x, zVal.z0y)}</span>
            <span className={`badge ${inJJ ? 'in' : 'out'}`}>{inJJ ? '∈ Julia' : '∉ Julia'}</span>
          </div>
        </div>

        <div className="presets-row">
          <span className="pl">Preset c:</span>
          <button className="pb" onClick={() => setCAndSync(-0.7269, 0.1889)}>Dendrite</button>
          <button className="pb" onClick={() => setCAndSync(-0.1, 0.651)}>Rabbit</button>
          <button className="pb" onClick={() => setCAndSync(0.285, 0.013)}>Siegel</button>
          <button className="pb" onClick={() => setCAndSync(-0.8, 0.156)}>San Marco</button>
          <button className="pb" onClick={() => setCAndSync(-1.476, 0)}>Real Axis</button>
          <button className="pb" onClick={() => setCAndSync(0, -0.8)}>Spiral</button>
        </div>

        <div className="exp">
          <div className="ec">
            <div className="et c">① Mandelbrot Set</div>
            <div className="eb">Bắt đầu tại <code>z₀=0</code>. Vary <code>c</code>. Vùng đen = bounded. <br/><strong>Kéo thả điểm c để Update Julia!</strong></div>
          </div>
          <div className="ec">
            <div className="et m">② Julia J(c)</div>
            <div className="eb">Fix <code>c</code> từ thẻ ①. <strong>Kéo thả điểm z₀</strong> để cập nhật thông số ②, ③ và quỹ đạo Orbit!</div>
          </div>
          <div className="ec">
            <div className="et o">③ z₀-Parameter Plane</div>
            <div className="eb">Fix <code>z₀</code> từ ②, vary <code>c</code>. Khi <code>z₀=0</code> trùng khớp hoàn toàn với bảng ①!</div>
          </div>
          <div className="ec">
            <div className="et p">④ Orbit Path</div>
            <div className="eb">Chuỗi <code>z₀,z₁,z₂,…</code> trên mặt phẳng phức. Bay ra ngoài vòng tròn đứt đoạn = diverge.</div>
          </div>
        </div>
      </div>

      <div className="fractal-main">
        <div className="grid">
          
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title"><span className="dot dot-o"></span>③ z₀-Plane</span>
              <span className="panel-formula">z₀ cố định · c = biến số</span>
            </div>
            <div className="canvas-wrap" onMouseDown={pWrapDown} onMouseMove={pWrapMove} onMouseUp={pWrapUp} onMouseLeave={pWrapLeave}>
              <canvas ref={pCanvas} className="canvas-abs"></canvas>
              <canvas ref={pOver} className="canvas-abs no-ptr"></canvas>
              <div className="chip">{pChipTxt}</div>
              <div className={`loading ${!pLoading ? 'gone' : ''}`}><div className="spin o"></div><span className="load-txt">Drawing…</span></div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="panel-title"><span className="dot dot-m"></span>② Julia Set — J(c)</span>
              <span className="panel-formula">c cố định · z₀ = biến số</span>
            </div>
            <div className="canvas-wrap" onMouseDown={jWrapDown} onMouseMove={jWrapMove} onMouseUp={jWrapUp} onMouseLeave={jWrapLeave}>
              <canvas ref={jCanvas} className="canvas-abs"></canvas>
              <canvas ref={jOver} className="canvas-abs no-ptr"></canvas>
              <div className="chip">{jChipTxt}</div>
              <div className={`loading ${!jLoading ? 'gone' : ''}`}><div className="spin m"></div><span className="load-txt">Drag on ①…</span></div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="panel-title"><span className="dot dot-c"></span>① Mandelbrot</span>
              <span className="panel-formula">z₀ = 0 cố định · c = biến số</span>
            </div>
            <div className="canvas-wrap" onMouseDown={mWrapDown} onMouseMove={mWrapMove} onMouseUp={mWrapUp} onMouseLeave={mWrapLeave}>
              <canvas ref={mCanvas} className="canvas-abs"></canvas>
              <canvas ref={mOver} className="canvas-abs no-ptr"></canvas>
              <div className="chip">{mChipTxt}</div>
              <div className={`loading ${!mLoading ? 'gone' : ''}`}><div className="spin c"></div><span className="load-txt">Drawing…</span></div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="panel-title"><span className="dot dot-p"></span>④ Orbit</span>
              <span className="panel-formula">z₀ → z² + c (lặp)</span>
            </div>
            <div className="canvas-wrap" style={{ cursor: 'default' }}>
              <canvas ref={oCanvas} className="canvas-abs" id="orbit-canvas"></canvas>
              <div className="chip">{oChipTxt}</div>
              <div className={`loading ${!oLoading ? 'gone' : ''}`}><div className="spin p"></div><span className="load-txt">Needs values…</span></div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}