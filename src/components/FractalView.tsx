import React, { useEffect, useRef, useState } from 'react';
import { IFractalStrategy, FractalState } from '../lib/new_fractals/IFractal';
import { KochSnowflake } from '../lib/new_fractals/KochSnowflake';
import { MinkowskiIsland } from '../lib/new_fractals/MinkowskiIsland';
import { SierpinskiTriangle, SierpinskiCarpet } from '../lib/new_fractals/Sierpinski';

interface Props {
  type: string;
}

export const FractalView: React.FC<Props> = ({ type }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<FractalState>({
    iterations: 4,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    color: '#00e5ff'
  });

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let color = '#00e5ff';
    let iterations = 5;
    
    if (type === 'MinkowskiIsland') {
      color = '#ffb300';
      iterations = 4;
    } else if (type === 'SierpinskiTriangle') {
      color = '#00ff88';
      iterations = 8;
    } else if (type === 'SierpinskiCarpet') {
      color = '#ff3399';
      iterations = 5;
    }

    setState({
      iterations,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      color
    });
  }, [type]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let strategy: IFractalStrategy | null = null;
    switch (type) {
      case 'KochSnowflake': strategy = new KochSnowflake(); break;
      case 'MinkowskiIsland': strategy = new MinkowskiIsland(); break;
      case 'SierpinskiTriangle': strategy = new SierpinskiTriangle(); break;
      case 'SierpinskiCarpet': strategy = new SierpinskiCarpet(); break;
    }

    if (strategy) {
      strategy.draw(ctx, canvas.width, canvas.height, state);
    }
  }, [type, state]);

  // Handle Zoom to Mouse Cursor
  const handleWheel = (e: React.WheelEvent) => {
    // We cannot reliably e.preventDefault() in React synthetic wheel if active, but wrapper stops overflow
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.8 : 1.25; // scroll scale
    
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    setState(s => {
      const newZoom = s.zoom * zoomFactor;
      // Formula: Offset_New = Mouse - Center - (Mouse - Center - Offset_Old) * (Zoom_New / Zoom_Old)
      const newOffsetX = mx - cx - (mx - cx - s.offsetX) * zoomFactor;
      const newOffsetY = my - cy - (my - cy - s.offsetY) * zoomFactor;

      // Calculate dynamic depth based on zoom. Base depth is roughly what handles zoom=1 nicely.
      let baseDepth = 5;
      let zoomThreshold = 2.0; // Zoom multiplier required for +1 depth
      let maxAllowedDepth = 25; // Max depth to avoid blowing call stack

      if (type === 'MinkowskiIsland') {
        baseDepth = 4;
        zoomThreshold = 1.8;
        maxAllowedDepth = 20; // 8 segments per recursive call, grows fast
      } else if (type === 'SierpinskiTriangle') {
        baseDepth = 8;
        zoomThreshold = 3; // Grows very fast, requires a lot of zoom for +1 depth (reduces lag)
        maxAllowedDepth = 20;
      } else if (type === 'SierpinskiCarpet') {
        baseDepth = 5;
        zoomThreshold = 4; // Extremely heavy (8 sub-rectangles per recursive call)
        maxAllowedDepth = 20;
      } else { // KochSnowflake
        baseDepth = 5;
        zoomThreshold = 1.5; // Starts with 4 lines
        maxAllowedDepth = 30; // High max because 4 segments + culling = smooth rendering
      }
      
      const depthIncrease = newZoom > 1 ? Math.floor(Math.log(newZoom) / Math.log(zoomThreshold)) : 0;
      const newIterations = Math.max(baseDepth, Math.min(baseDepth + depthIncrease, maxAllowedDepth));

      return { 
        ...s, 
        zoom: newZoom, 
        offsetX: newOffsetX, 
        offsetY: newOffsetY,
        iterations: newIterations // Dynamically updated depth
      };
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) { 
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    setState(s => ({ ...s, offsetX: s.offsetX + dx, offsetY: s.offsetY + dy }));
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsPanning(false);

  return (
    <div className="fractal-main" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
      <div className="panel-head" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '24px', fontFamily: 'var(--display)', color: state.color, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
          {type.replace(/([A-Z])/g, ' $1').trim()}
        </h2>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--dim)', fontFamily: 'var(--mono)' }}>
            Zoom: {(state.zoom * 100).toFixed(0)}%
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text)', fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center' }}>
            Max Iterations (Depth): 
            <input 
              type="number"
              value={state.iterations}
              onChange={(e) => setState(s => ({ ...s, iterations: Math.max(0, parseInt(e.target.value) || 0) }))}
              style={{ 
                width: '60px', 
                marginLeft: '8px', 
                background: 'var(--surf2)', 
                border: '1px solid var(--border)', 
                color: 'var(--cyan)', 
                padding: '4px 6px',
                borderRadius: '4px',
                textAlign: 'center',
                outline: 'none'
              }}
            />
          </span>
        </div>
      </div>
      
      <div 
        ref={wrapRef}
        className="canvas-wrap" 
        style={{ flex: 1, border: '1px solid ' + state.color + '40', borderRadius: '8px', cursor: isPanning ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} className="canvas-abs"></canvas>
      </div>
    </div>
  );
};
